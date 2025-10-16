'use server';
/**
 * @fileOverview Converts characters in an input string to special characters based on a predefined mapping.
 *
 * - characterConversion - Converts an input string into a confidential format using a special character map.
 * - CharacterConversionInput - The input type for the characterConversion function.
 * - CharacterConversionOutput - The return type for the characterConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterConversionInputSchema = z.object({
  inputString: z
    .string()
    .describe('The input string to be converted.'),
});
export type CharacterConversionInput = z.infer<typeof CharacterConversionInputSchema>;

const CharacterConversionOutputSchema = z.object({
  convertedString: z
    .string()
    .describe('The converted string with special characters.'),
});
export type CharacterConversionOutput = z.infer<typeof CharacterConversionOutputSchema>;

export async function characterConversion(input: CharacterConversionInput): Promise<CharacterConversionOutput> {
  return characterConversionFlow(input);
}

const characterMap = {
    'g': '(_;',
    'i': '][',
    't': '-/-',
    'h': '#',
    'u': '_',
    'b': '`+',
    'a': '@',
    's': '$',
    'n': '9',
    'r': 'i`',
    'm': '1+6+5'
};

const characterConversionFlow = ai.defineFlow(
  {
    name: 'characterConversionFlow',
    inputSchema: CharacterConversionInputSchema,
    outputSchema: CharacterConversionOutputSchema,
  },
  async input => {
    let converted = '';
    for (const char of input.inputString.toLowerCase()) {
      if (char in characterMap) {
        converted += characterMap[char as keyof typeof characterMap];
      } else {
        converted += char;
      }
    }
    return { convertedString: converted };
  }
);
