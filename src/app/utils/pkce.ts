// src/app/utils/pkce.ts
import * as CryptoJS from 'crypto-js';

export function generateCodeVerifier(): string {
  // 32 random bytes → 64 hex chars (allowed A-F0-9 are valid URL-safe chars)
  const arr = window.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(arr)
    .map(b => ('0' + b.toString(16)).slice(-2))
    .join('');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = CryptoJS.SHA256(verifier);
  return CryptoJS.enc.Base64.stringify(hash)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
