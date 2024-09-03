import { randomBytes } from 'crypto';

/**
 * Generates a secure random nonce string.
 * @param length The length of the nonce string. Default is 16 bytes.
 * @returns A hexadecimal string representing the nonce.
 */
export const getNonce = (length: number = 16): string => {
  const nonce = randomBytes(length);
  return nonce.toString('hex');
};
