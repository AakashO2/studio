'use server';

import { getFirestore, doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';
import * as otpauth from 'otpauth';
import * as qrcode from 'qrcode';

// Ensure Firebase Admin is initialized
if (!getApps().length) {
  initializeApp({
    // projectId, etc. will be automatically inferred from the environment
  });
}

const firestore = getFirestore();
const adminAuth = getAuth();

const characterMap: { [key: string]: string } = {
  'A': '/-\\', 'a': '@',
  'B': 'I3', 'b': '6',
  'C': '(', 'c': '^',
  'D': '|)', 'd': '-:-',
  'E': '8', 'e': '8',
  'F': '1=', 'f': '4',
  'G': '(_;',
  'H': 'i-!', 'h': '#',
  'I': '][',
  'J': '_7',
  'K': '/<',
  'L': 'I_', 'l': '1',
  'M': '[\\/]', 'm': '7+5',
  'N': '!\\i', 'n': '9',
  'O': '{}', 'o': 'o-',
  'P': '\\o', 'p': '%',
  'Q': '0_', 'q': 'o-',
  'R': '|-\\_', 'r': "i'",
  'S': '5', 's': '$',
  'T': '|', 't': '-/-',
  'U': '6_9', 'u': '_',
  'V': '\\/',
  'W': '\\||',
  'X': '><', 'x': '(+)',
  'Y': '>-',
  'Z': '"/_',
  '&': '8',
  ' ': '_',
};

function convertString(input: string): string {
  return input.split('').map(char => characterMap[char] || char).join('');
}

const allSpecialChars = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";

export async function generatePasswordAction(inputString: string): Promise<string> {
  if (!inputString) {
    return '';
  }

  // Simulate network latency for a better UX with loading states
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  let password = convertString(inputString);

  const passwordChars = new Set(password.split(''));
  const availableSpecialChars = allSpecialChars.split('').filter(char => !passwordChars.has(char));

  let additionalChars = '';
  const charsToAdd = Math.max(3, Math.min(5, availableSpecialChars.length));

  for (let i = 0; i < charsToAdd; i++) {
    if (availableSpecialChars.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableSpecialChars.length);
    const char = availableSpecialChars.splice(randomIndex, 1)[0];
    additionalChars += char;
  }
  
  const combinedChars = (password + additionalChars).split('');
  
  for (let i = combinedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedChars[i], combinedChars[j]] = [combinedChars[j], combinedChars[i]];
  }

  return combinedChars.join('');
}

export async function createOtpUser(email: string): Promise<{ success: boolean; qrCodeDataUrl?: string; secret?: string; error?: string }> {
  try {
    const lowercasedEmail = email.toLowerCase();
    
    // Check if user already exists in Firestore
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', lowercasedEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return { success: false, error: 'User with this email already exists.' };
    }

    // Generate OTP secret
    const secret = new otpauth.Secret({ size: 20 });
    
    // Generate OTP URI
    const totp = new otpauth.TOTP({
        issuer: 'PasswordForge',
        label: lowercasedEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret,
    });
    const uri = totp.toString();

    // Create user in Firebase Auth (no password)
    const userRecord = await adminAuth.createUser({ email: lowercasedEmail, emailVerified: true });

    // Store user info and OTP secret in Firestore
    const userDocRef = doc(firestore, 'users', userRecord.uid);
    await setDoc(userDocRef, {
      uid: userRecord.uid,
      email: lowercasedEmail,
      otpSecret: secret.base32,
      isOtpEnabled: true,
      createdAt: new Date().toISOString(),
    });

    const qrCodeDataUrl = await qrcode.toDataURL(uri);

    return { success: true, qrCodeDataUrl, secret: secret.base32 };

  } catch (error: any) {
    console.error("Error creating OTP user:", error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

export async function loginWithOtp(email: string, otp: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
        const lowercasedEmail = email.toLowerCase();
        
        // Find user by email in Firestore
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', lowercasedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: 'Invalid login details.' };
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        if (!userData.isOtpEnabled || !userData.otpSecret) {
            return { success: false, error: 'OTP is not enabled for this account.' };
        }
        
        const secret = otpauth.Secret.fromBase32(userData.otpSecret);

        const totp = new otpauth.TOTP({
            issuer: 'PasswordForge',
            label: lowercasedEmail,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: secret,
        });

        const delta = totp.validate({ token: otp, window: 1 });
        
        if (delta === null) {
            return { success: false, error: 'Invalid OTP code.' };
        }

        // OTP is valid, generate a custom token for client-side login
        const customToken = await adminAuth.createCustomToken(userData.uid);

        return { success: true, token: customToken };

    } catch (error: any) {
        console.error("Error logging in with OTP:", error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
