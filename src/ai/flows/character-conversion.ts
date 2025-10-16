'use server';
/**
 * @fileOverview Converts characters in an input string to special characters based on a predefined mapping.
 *
 * - characterConversion - Converts an input string into a password using special character mapping.
 * - CharacterConversionInput - The input type for the characterConversion function.
 * - CharacterConversionOutput - The return type for the characterConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacterConversionInputSchema = z.object({
  inputString: z
    .string()
    .describe('The input string to be converted into a password.'),
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
  'A': '/-\',
  'a': '@',
  'B': 'I3',
  'b': '6',
  'C': '(',
  'c': '^',
  'D': '|)',
  'd': '-:-',
  'E': '8',
  'e': '8',
  'F': '1=',
  'f': '4',
  'G': '(_;',
  'n': '9',
  'H': 'i-!',
  'h': '#',
  'I': '][',
  'l': '1',
  'J': '_7',
  'K': '/<',
  'L': 'I_',
  'M': '[/\/]',
  'm': '7+5',
  'N': '!\\i',
  'O': '{}',
  'o': 'o-',
  'P': '\\o',
  'p': '%',
  'Q': '0_',n'q': 'o-',
  'R': '|-\_',
  'r': 'i`',
  'S': '5',
  's': '$',
  'T': '|