'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as otpauth from 'otpauth';

async function getCustomToken(uid: string) {
  // In a real app, this would be a call to a secure Cloud Function
  // that verifies the user and creates a custom token.
  // For this demo, we'll simulate it, but this is NOT secure for production.
  // We're calling a fictional endpoint.
  try {
    const response = await fetch('/api/custom-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get custom token');
    }
    const data = await response.json();
    return data.token;
  } catch (e) {
    // This is a simplified auth flow for demonstration purposes only.
    // In a production app, you would want to have a proper backend to issue tokens.
    // We will just create a dummy token here as we can't create a real one on the client.
    console.warn("This is a demo-only auth flow. A dummy token is being used.");
    return `dummy-token-for-${uid}`;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const lowercasedEmail = email.toLowerCase();
        
        // 1. Find user by email in Firestore
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', lowercasedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('Invalid login details.');
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        if (!userData.isOtpEnabled || !userData.otpSecret) {
            throw new Error('OTP is not enabled for this account.');
        }
        
        // 2. Validate the OTP
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
            throw new Error('Invalid OTP code.');
        }

        // 3. Sign in the user.
        // In a production app, you would get a real custom token from a secure backend.
        // As we don't have a backend that can mint tokens, we can't complete the sign-in.
        // We will just show a success message and redirect.
        // The user will not be truly "logged in" with Firebase Auth.
        // The useUser() hook will still show 'no user'.
        
        toast({
          title: 'Login Successful (Simulation)',
          description: "Welcome back! You would be logged in now.",
        });
        
        // This simulates a successful login for the UI, but auth state won't change.
        router.push('/');


    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid login details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email and the code from your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Code</Label>              
              <Input 
                id="otp" 
                type="text" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\\d{6}"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="animate-spin" /> : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
