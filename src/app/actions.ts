'use server';

import { characterConversion } from '@/ai/flows/character-conversion';

export async function generatePasswordAction(inputString: string): Promise<string> {
  if (!inputString) {
    return '';
  }
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { convertedString } = await characterConversion({ inputString });

  const allSpecialChars = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";
  const passwordChars = new Set(convertedString.split(''));
  const availableSpecialChars = allSpecialChars.split('').filter(char => !passwordChars.has(char));

  let additionalChars = '';
  const charsToAdd = Math.max(3, Math.min(5, availableSpecialChars.length));

  for (let i = 0; i < charsToAdd; i++) {
    if (availableSpecialChars.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableSpecialChars.length);
    const char = availableSpecialChars.splice(randomIndex, 1)[0];
    additionalChars += char;
  }
  
  const combinedChars = (convertedString + additionalChars).split('');
  
  // Fisher-Yates shuffle
  for (let i = combinedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedChars[i], combinedChars[j]] = [combinedChars[j], combinedChars[i]];
  }

  return combinedChars.join('');
}
