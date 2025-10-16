# **App Name**: PasswordForge

## Core Features:

- Input Capture: Capture website name or person's name as input string.
- Character Conversion: Convert each character of the input string to its corresponding special character based on the predefined mappings using the LLM as a tool. Input sanitization ensures output uniqueness, avoiding duplicate replacements.
- Password Assembly: Assemble the converted characters into a password string.
- Random Special Character Addition: Incorporate additional randomized special characters, ensuring they are unique to the existing password string.
- Password Display: Display the final generated password to the user.
- Copy to Clipboard: Allow users to copy the generated password to their clipboard.
- Password Storage: Store user's passwords securely in a database associated with their account.
- Password Management: Allow users to view, add, delete, and manage their stored passwords.

## Style Guidelines:

- Primary color: Deep indigo (#4B0082) to evoke security and sophistication.
- Background color: Very light lavender (#E6E6FA), providing a soft, secure feel, almost white but not quite.
- Accent color: Bright cyan (#00FFFF), highlighting the functional nature of the password generator with clear affordances to invoke its actions.
- Font: 'Inter', sans-serif, for a modern, readable interface.
- Use lock and key icons, alongside simple circular call to action icons.
- Clean, minimalist layout, with a focus on usability. Input field at the top, generated password display in the middle, and copy-to-clipboard button at the bottom. Password management interface accessible via a separate page or modal.
- Subtle transitions on password generation and copy-to-clipboard actions. Smooth animations for adding, deleting, and viewing passwords in the password management interface.