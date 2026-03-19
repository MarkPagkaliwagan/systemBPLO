/**
 * Validates password strength
 * @param password - Password to validate
 * @returns { isValid: boolean, message: string } - Validation result
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }

  return { isValid: true, message: 'Password is valid' };
}

/**
 * Generates a secure random password (browser-safe version)
 * @returns string - Generated password
 */
export function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Use browser crypto API
  const getRandomInt = (max: number) => {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
  };
  
  // Ensure at least one of each required character type
  password += lowercase[getRandomInt(lowercase.length)];
  password += uppercase[getRandomInt(uppercase.length)];
  password += numbers[getRandomInt(numbers.length)];
  password += specialChars[getRandomInt(specialChars.length)];
  
  // Fill remaining characters
  const allChars = lowercase + uppercase + numbers + specialChars;
  const remainingLength = 8 + getRandomInt(5); // 8-12 characters total
  
  for (let i = 4; i < remainingLength; i++) {
    password += allChars[getRandomInt(allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => getRandomInt(3) - 1).join('');
}
