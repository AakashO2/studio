"use client";

import { useState, useTransition } from "react";
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
  Loader,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { addDoc, deleteDoc, collection, doc } from "firebase/firestore";
import Link from "next/link";
import { useMemo } from "react";

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
  'R': '|-\\_', 'r': "i`",
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

async function generatePasswordAction(inputString: string): Promise<string> {
  if (!inputString) {
    return '';
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  
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


type StoredPassword = {
  id: string;
  websiteName: string;
  encodedPassword: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userPasswordsCollection = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/passwords`);
  }, [firestore, user]);

  const { data: passwords, isLoading: passwordsLoading } = useCollection<Omit<StoredPassword, 'id'>>(userPasswordsCollection);


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

  const handleSavePassword = async () => {
    if (!generatedPassword || !userPasswordsCollection) return;
    const newPassword = { websiteName: name, encodedPassword: generatedPassword, lastModified: new Date().toISOString() };
    try {
      await addDoc(userPasswordsCollection, newPassword);
      toast({
        title: "Password Saved",
        description: `Password for "${name}" has been saved to your vault.`,
      });
      setGeneratedPassword("");
      setName("");
    } catch (error: any) {
       toast({
        title: "Error Saving Password",
        description: error.message || "Could not save the password.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePassword = async (id: string) => {
    if (!firestore || !user) return;
    const docRef = doc(firestore, `users/${user.uid}/passwords`, id);
    try {
      await deleteDoc(docRef);
      toast({
        title: "Password Deleted",
        description: "The password has been removed from your vault.",
      });
    } catch (error: any) {
       toast({
        title: "Error Deleting Password",
        description: error.message || "Could not delete the password.",
        variant: "destructive",
      });
    }
  };

  // Due to the client-side auth simulation, we can't rely on `isUserLoading` or `user` for the initial screen.
  // We'll show a generic loading state briefly and then the main content.
  // A real app would have a more robust loading skeleton.
  const [isAppLoading, setIsAppLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsAppLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24">
        <Loader className="animate-spin" />
      </main>
    );
  }

  // The login flow is simulated, so we can't truly protect the route.
  // A user could access this page without "logging in".
  // We'll show the UI assuming they're logged in. A full production app
  // would use routing rules and proper auth state to protect this page.
  
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
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
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="text-primary" />
              Password Vault
            </CardTitle>
            <CardDescription>
              Your saved passwords. Stored securely. As auth is simulated, this may not work correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {passwordsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : passwords && passwords.length > 0 ? (
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
                          <TableCell className="font-medium">{p.websiteName}</TableCell>
                          <TableCell className="font-mono">{p.encodedPassword}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyToClipboard(p.encodedPassword, p.id)}
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
               ) : (
                <p className="text-muted-foreground text-center">Your vault is empty. Save a password to see it here.</p>
              )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
