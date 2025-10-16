
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  KeyRound,
  Sparkles,
  Copy,
  Check,
  FileLock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { characterConversion } from '@/ai/flows/character-conversion';


export default function Home() {
  const [inputText, setInputText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const { toast } = useToast();

  const handleConvertText = () => {
    if (!inputText) {
      toast({
        title: "Input required",
        description: "Please enter some text to convert.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const { convertedString } = await characterConversion({ inputString: inputText });
      setConvertedText(convertedString);
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your confidential text is ready.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-primary flex items-center justify-center gap-3">
            <FileLock className="h-10 w-10" />
            Confidential Text Converter
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Convert your letters and paragraphs into a confidential format.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="text-primary" />
              Text Converter
            </CardTitle>
            <CardDescription>
              Enter any text below to convert it using the confidential character map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder="Type your confidential text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-base min-h-[150px]"
              />
              <Button onClick={handleConvertText} disabled={isPending} className="w-full sm:w-auto self-end">
                <Sparkles className="mr-2 h-4 w-4" />
                {isPending ? "Converting..." : "Convert Text"}
              </Button>
            </div>
          </CardContent>

          {(isPending || convertedText) && (
            <CardFooter className="flex flex-col items-start gap-4 bg-muted/50 p-6 rounded-b-lg">
              <h3 className="font-semibold text-foreground">
                Your Converted Text:
              </h3>
              {isPending ? (
                 <div className="w-full space-y-2">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-24" />
                 </div>
              ) : convertedText ? (
                <div className="w-full space-y-3">
                  <div className="relative w-full">
                    <Textarea
                      readOnly
                      value={convertedText}
                      className="pr-10 text-base font-mono bg-background min-h-[150px]"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={() => handleCopyToClipboard(convertedText)}
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
