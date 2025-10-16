'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, Mail } from 'lucide-react';
import { createOtpUser } from '../actions';

type QrCodeInfo = {
  qrCodeDataUrl: string;
  secret: string;
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeInfo, setQrCodeInfo] = useState<QrCodeInfo | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleGenerateQrCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter your email address.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await createOtpUser(email);
      if (result.success && result.qrCodeDataUrl && result.secret) {
        setQrCodeInfo({ qrCodeDataUrl: result.qrCodeDataUrl, secret: result.secret });
        toast({
          title: 'QR Code Generated',
          description: 'Scan the code with your authenticator app.',
        });
      } else {
        throw new Error(result.error || 'Could not generate QR code.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {!qrCodeInfo ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your email to generate a QR code for your authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateQrCode} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Scan to Register</CardTitle>
              <CardDescription>
                Scan this QR code with Google Authenticator, Microsoft Authenticator, or another compatible app.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Image
                src={qrCodeInfo.qrCodeDataUrl}
                alt="QR Code for OTP setup"
                width={256}
                height={256}
                className="rounded-lg border p-2"
              />
               <Alert>
                <QrCode className="h-4 w-4" />
                <AlertTitle>Important!</AlertTitle>
                <AlertDescription>
                  You must scan this code to be able to log in. Once you have scanned it, click Finish.
                </AlertDescription>
              </Alert>

              <Button onClick={handleFinish} className="w-full">
                Finish & Go to Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
