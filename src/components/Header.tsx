'use client';

import Link from 'next/link';
import { Lock, LogOut } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { getAuth, signOut } from 'firebase/auth';
import { Button } from './ui/button';

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex items-center justify-between p-4 h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Lock />
          <span>PasswordForge</span>
        </Link>
        <div className="flex items-center gap-4">
          {!isUserLoading &&
            (user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
