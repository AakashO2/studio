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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as otpauth from 'otpauth';

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
            throw new Error('Invalid login details. User not found.');
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

        // 3. Sign in the user with their email and the temporary password stored in Firestore
        if (!userData.tempPassword) {
          throw new Error("Cannot log in. Account setup is incomplete.");
        }

        await signInWithEmailAndPassword(auth, lowercasedEmail, userData.tempPassword);
        
        toast({
          title: 'Login Successful',
          description: "Welcome back!",
        });
        
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
