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
    'A': '/-|', 'a': '@', 'B': 'I3', 'b': '`+', 'C': '(', 'c': '^', 'D': '|)', 'd': '-:-',
    'E': '8', 'e': '=', 'F': '1=', 'f': '4', 'G': '(_;', 'g': ' ', 'H': 'i-!', 'h': '#',
    'I': '][', 'i': '][', 'J': '_7', 'K': '/<', 'k': 'k', 'L': 'I_', 'l': '1', 'M': '[|/]',
    'm': '1+6+5', 'N': '!/i', 'n': '9', 'O': '{}', 'o': '5', 'P': 'o/', 'p': '%',
    'Q': '0_', 'q': 'o-', 'R': '_/-|', 'r': 'i`', 'S': '/', 's': '$', 'T': '"|"',
    't': '-/-', 'U': '|_/', 'u': '_', 'V': '|/', 'v': ';/', 'W': '|||', 'w': '8',
    'X': '><', 'x': '(+)', 'Y': '>-', 'y': '7', 'Z': '"/_', 'z': '-|.'
};

const characterConversionFlow = ai.defineFlow(
  {
    name: 'characterConversionFlow',
    inputSchema: CharacterConversionInputSchema,
    outputSchema: CharacterConversionOutputSchema,
  },
  async input => {
    let converted = '';
    for (const char of input.inputString) {
      if (char in characterMap) {
        converted += characterMap[char as keyof typeof characterMap];
      } else {
        converted += char;
      }
    }
    return { convertedString: converted };
  }
);
