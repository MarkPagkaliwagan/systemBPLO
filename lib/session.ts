// lib/session.ts

const SECRET_KEY = process.env.SECRET_KEY ?? '';

interface SessionPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

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
      iat: now,
      exp: now + ttlSeconds * 1000,
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

/**
 * Verifies a session token's HMAC signature and expiry.
 * Returns the decoded payload if valid, null otherwise.
 *
 * @param token - The session token to verify
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!SECRET_KEY) {
    console.error('[session] SECRET_KEY is not set. Cannot verify session token.');
    return null;
  }

  try {
    const [payloadB64, signatureB64] = token.split('.');

    if (!payloadB64 || !signatureB64) {
      return null;
    }

    // Re-compute expected signature
    const key = await getHmacKey(SECRET_KEY);

    const expectedSigBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payloadB64)
    );

    // Decode received signature
    const receivedSigBytes = Uint8Array.from(
      atob(signatureB64),
      c => c.charCodeAt(0)
    );

    // Constant-time comparison via crypto.subtle.verify
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      receivedSigBytes,
      new TextEncoder().encode(payloadB64)
    );

    if (!isValid) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(atob(payloadB64));

    // Check expiry
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;

  } catch {
    return null;
  }
}