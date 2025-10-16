'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Lock, KeyRound, Sparkles, Copy, Check, Trash2, PlusCircle, Vault } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { characterConversion } from '@/ai/flows/character-conversion';
import { useUser, useFirestore, useCollection } from '@/firebase';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import Link from 'next/link';

interface PasswordEntry {
  id: string;
  websiteName: string;
  encodedPassword: string;
}

export default function Home() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [websiteName, setWebsiteName] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { toast } = useToast();
  
  const passwordsCollection = user
    ? collection(firestore, 'users', user.uid, 'passwords')
    : null;

  const { data: passwords, isLoading: isLoadingPasswords } = useCollection<PasswordEntry>(passwordsCollection);

  const handleGeneratePassword = () => {
    if (!websiteName) {
      toast({
        title: 'Website name required',
        description: 'Please enter a website or service name.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      try {
        const { convertedString } = await characterConversion({ inputString: websiteName });
        const randomChars = generateRandomChars(5);
        setGeneratedPassword(convertedString + randomChars);
      } catch (error) {
        toast({
          title: 'Error generating password',
          description: 'Could not generate a password at this time.',
          variant: 'destructive',
        });
      }
    });
  };

  const generateRandomChars = (length: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied to clipboard!',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePassword = async () => {
    if (!generatedPassword || !websiteName || !user || !passwordsCollection) return;

    try {
      await addDoc(passwordsCollection, {
        websiteName: websiteName,
        encodedPassword: generatedPassword,
        lastModified: serverTimestamp(),
      });
      toast({
        title: 'Password saved!',
        description: `${websiteName} password has been added to your vault.`,
      });
      setWebsiteName('');
      setGeneratedPassword('');
    } catch (e: any) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not save password. Check security rules.',
      });
    }
  };

  const handleDeletePassword = async (passwordId: string) => {
    if (!user) return;
    const passwordDocRef = doc(firestore, 'users', user.uid, 'passwords', passwordId);
    try {
      await deleteDoc(passwordDocRef);
      toast({
        title: 'Password deleted.',
      });
    } catch (e: any) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Could not delete password. Check security rules.',
        });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Skeleton className="h-48 w-full max-w-4xl" />
      </div>
    );
  }

  if (!user) {
    return (
       <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
        <Card className="w-full max-w-md p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <Lock /> Welcome to PasswordForge
            </CardTitle>
            <CardDescription className="pt-2">
              Please log in or sign up to generate and manage your passwords.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="text-primary" />
              Password Generator
            </CardTitle>
            <CardDescription>
              Enter a service name to forge a strong and unique password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="e.g., Google, Instagram, GitHub"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="text-base"
              />
              <Button onClick={handleGeneratePassword} disabled={isPending} className="sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                {isPending ? 'Forging...' : 'Forge Password'}
              </Button>
            </div>
            {(isPending || generatedPassword) && (
              <div className="space-y-3 pt-4">
                <h3 className="font-semibold text-foreground">Your New Password:</h3>
                {isPending ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="relative flex items-center">
                    <Input
                      readOnly
                      value={generatedPassword}
                      className="pr-20 text-base font-mono bg-muted/50"
                    />
                    <div className="absolute right-1 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyToClipboard(generatedPassword, 'new')}
                      >
                        {copiedId === 'new' ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </Button>
                      <Button size="sm" onClick={handleSavePassword}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Save to Vault
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vault className="text-primary" />
              Password Vault
            </CardTitle>
            <CardDescription>
              Your saved passwords. Click to copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingPasswords ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : passwords && passwords.length > 0 ? (
              <div className="space-y-2">
                {passwords.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex-1">
                      <p className="font-semibold">{p.websiteName}</p>
                      <p className="font-mono text-sm text-muted-foreground truncate">{p.encodedPassword}</p>
                    </div>
                    <div className='flex items-center'>
                      <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(p.encodedPassword, p.id)}>
                        {copiedId === p.id ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-s" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePassword(p.id)}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">Your vault is empty. Save a password to see it here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
