"use server";

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
  'R': '|-\\_', 'r': "i'",
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

export async function generatePasswordAction(inputString: string): Promise<string> {
  if (!inputString) {
    return '';
  }

  // Simulate network latency for a better UX with loading states
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 1. Convert characters using local mapping
  let password = convertString(inputString);

  // 2. Add random special characters that are not in the generated password
  const passwordChars = new Set(password.split(''));
  const availableSpecialChars = allSpecialChars.split('').filter(char => !passwordChars.has(char));

  let additionalChars = '';
  // Add between 3 and 5 additional characters
  const charsToAdd = Math.max(3, Math.min(5, availableSpecialChars.length));

  for (let i = 0; i < charsToAdd; i++) {
    if (availableSpecialChars.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableSpecialChars.length);
    const char = availableSpecialChars.splice(randomIndex, 1)[0];
    additionalChars += char;
  }
  
  // Shuffle all characters together for better security
  const combinedChars = (password + additionalChars).split('');
  
  // Fisher-Yates shuffle
  for (let i = combinedChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedChars[i], combinedChars[j]] = [combinedChars[j], combinedChars[i]];
  }

  return combinedChars.join('');
}