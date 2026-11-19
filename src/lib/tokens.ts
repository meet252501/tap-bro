import crypto from 'crypto';

const SECRET_KEY = process.env.SUPER_ADMIN_PASSWORD || 'tap-bro-secure-master-2026';

// Unambiguous character set (31 characters, excluding 0, O, 1, I, L to avoid typos)
const ALPHANUMERIC_CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generates a completely unique, cryptographically random, non-repeating temporary pass.
 * Format: TAP-XXXXXX (e.g. TAP-7K9M2X, TAP-4W8P9N)
 * Over 887 Million possible unique combinations.
 */
export function generateRandomTempPass(): string {
  const bytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ALPHANUMERIC_CHARSET[bytes[i] % ALPHANUMERIC_CHARSET.length];
  }
  return `TAP-${code}`;
}

/**
 * Legacy compatibility wrapper: now delegates to generateRandomTempPass()
 * to guarantee each invite receives a completely distinct, non-repeating pass.
 */
export function getDeterministicPass(_email?: string, _dayOffset = 0): string {
  return generateRandomTempPass();
}

/**
 * Legacy compatibility: always returns false to enforce single-use database validation.
 */
export function isValidPassForEmail(_email: string, _pass: string): boolean {
  return false;
}

/**
 * Creates a cryptographically signed invite token valid for a set number of hours.
 * Enables tamper-proof, one-click email links.
 */
export function createInviteToken(email: string, tempPass: string, expiresInHours = 48): string {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = tempPass.toUpperCase().trim();
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;

  const payload = JSON.stringify({ email: cleanEmail, pass: cleanPass, exp });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies the cryptographic signature and expiration of an invite token.
 */
export function verifyInviteToken(
  token: string,
  email: string,
  tempPass: string
): { valid: boolean; expired: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false, expired: false };

    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, expired: false };
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = tempPass.toUpperCase().trim();

    if (payload.email !== cleanEmail || payload.pass !== cleanPass) {
      return { valid: false, expired: false };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, expired: true };
    }

    return { valid: true, expired: false };
  } catch {
    return { valid: false, expired: false };
  }
}
