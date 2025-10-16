
'use client';

import Link from 'next/link';
import { FileLock } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b">
      <div className="container mx-auto flex items-center justify-between p-4 h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <FileLock />
          <span>Confidential Text Converter</span>
        </Link>
      </div>
    </header>
  );
}
