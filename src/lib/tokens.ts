import crypto from 'crypto';

const SECRET_KEY = process.env.SUPER_ADMIN_PASSWORD || 'tap-bro-secure-master-2026';

/**
 * Generates a deterministic 4-digit temporary pass for an email address and day slot.
 * Valid across all serverless containers and stateless execution contexts.
 */
export function getDeterministicPass(email: string, dayOffset = 0): string {
  const cleanEmail = email.toLowerCase().trim();
  const daySlot = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) + dayOffset;
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`tapbro:pass:${cleanEmail}:${daySlot}`)
    .digest('hex');
  const code = (parseInt(hash.slice(0, 8), 16) % 9000) + 1000;
  return `TAP-${code}`;
}

/**
 * Checks if a temporary pass is valid for the given email within a 48-hour window
 * (today, yesterday, or 2 days ago + clock-skew tomorrow).
 */
export function isValidPassForEmail(email: string, pass: string): boolean {
  if (!email || !pass) return false;
  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = pass.toUpperCase().trim();

  // Check 48-hour window slots: today (0), yesterday (-1), 2 days ago (-2), and clock-skew tolerance (+1)
  const slots = [0, -1, -2, 1];
  for (const slot of slots) {
    if (getDeterministicPass(cleanEmail, slot) === cleanPass) {
      return true;
    }
  }
  return false;
}

/**
 * Creates a cryptographically signed invite token valid for a set number of hours.
 * Enables resilient, stateless verification across Vercel serverless containers.
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
