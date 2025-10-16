"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  KeyRound,
  Sparkles,
  Copy,
  Save,
  Trash2,
  Lock,
  Check,
} from "lucide-react";
import { generatePasswordAction } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type StoredPassword = {
  id: string;
  name: string;
  value: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("passwords");
      if (stored) {
        setPasswords(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse passwords from localStorage", error);
    }
  }, []);

  const handleGeneratePassword = () => {
    if (!name) {
      toast({
        title: "Input required",
        description: "Please enter a name or website.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const result = await generatePasswordAction(name);
      setGeneratedPassword(result);
    });
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({
      title: "Copied to clipboard!",
      description: "Your password is ready to be used.",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSavePassword = () => {
    if (!generatedPassword) return;
    const newPassword = { id: crypto.randomUUID(), name, value: generatedPassword };
    const updatedPasswords = [...passwords, newPassword];
    setPasswords(updatedPasswords);
    window.localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
    toast({
      title: "Password Saved",
      description: `Password for "${name}" has been saved to your vault.`,
    });
    setGeneratedPassword("");
    setName("");
  };

  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((p) => p.id !== id);
    setPasswords(updatedPasswords);
    window.localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
    toast({
      title: "Password Deleted",
      description: "The password has been removed from your vault.",
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-primary flex items-center justify-center gap-3">
            <Lock className="h-10 w-10" />
            PasswordForge
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Craft strong, unique passwords from any name or word.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="text-primary" />
              Password Generator
            </CardTitle>
            <CardDescription>
              Enter a website or person's name to generate a memorable and
              secure password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="e.g., GitHub, John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePassword()}
                className="text-base"
              />
              <Button onClick={handleGeneratePassword} disabled={isPending} className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                {isPending ? "Forging..." : "Forge Password"}
              </Button>
            </div>
          </CardContent>

          {(isPending || generatedPassword) && (
            <CardFooter className="flex flex-col items-start gap-4 bg-muted/50 p-6 rounded-b-lg">
              <h3 className="font-semibold text-foreground">
                Your Forged Password:
              </h3>
              {isPending ? (
                 <div className="w-full space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-24" />
                 </div>
              ) : generatedPassword ? (
                <div className="w-full space-y-3">
                  <div className="relative w-full">
                    <Input
                      readOnly
                      value={generatedPassword}
                      className="pr-10 text-lg font-mono bg-background"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => handleCopyToClipboard(generatedPassword, 'new')}
                    >
                      {copied === 'new' ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={handleSavePassword}>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Vault
                  </Button>
                </div>
              ) : null}
            </CardFooter>
          )}
        </Card>

        {passwords.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="text-primary" />
                Password Vault
              </CardTitle>
              <CardDescription>
                Your saved passwords. Stored securely in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passwords.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono">{p.value}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyToClipboard(p.value, p.id)}
                            >
                               {copied === p.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              <span className="sr-only">Copy</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePassword(p.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive/80" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
