// lib/session.ts

const SECRET_KEY = process.env.SECRET_KEY ?? '';

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a cryptographically signed session token.
 * Format: base64(payload).base64(hmac-signature)
 *
 * @param userId     - The authenticated user's ID
 * @param role       - The authenticated user's role
 * @param ttlSeconds - Token lifetime in seconds (default: 8 hours)
 */
export async function createSessionToken(
  userId: string,
  role: string,
  ttlSeconds: number = 60 * 60 * 8
): Promise<string> {
  if (!SECRET_KEY) {
    throw new Error('[session] SECRET_KEY is not set. Cannot create session token.');
  }

  const now = Date.now();

  const payload = btoa(
    JSON.stringify({
      userId,
      role,
      iat: now,                      // issued at (ms)
      exp: now + ttlSeconds * 1000,  // expiry (ms)
    })
  );

  const key = await getHmacKey(SECRET_KEY);

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  );

  const signature = btoa(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  return `${payload}.${signature}`;
}