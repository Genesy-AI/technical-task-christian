/**
 * Email verification provider contract.
 *
 * The previous implementation was an inline mock that slept for 20s on certain
 * addresses, which combined with a 1s activity timeout and Temporal's default
 * (unbounded) retry policy to hang the workflow forever. Modelling verification
 * as a provider keeps the mock swappable for a real vendor (ZeroBounce, NeverBounce,
 * Bouncer, ...) without touching the workflow or the activity wiring.
 */

/**
 * `unknown` is deliberately distinct from `invalid`: a provider being unreachable
 * or rate-limiting us is not evidence that the address is bad, and we must not
 * mark a good lead as unverifiable-forever because of a transient upstream issue.
 */
export type EmailVerificationStatus = 'valid' | 'invalid' | 'unknown'

export interface EmailVerificationResult {
  status: EmailVerificationStatus
  /** Which provider produced the verdict; useful for debugging and audit trails. */
  provider: string
  /** Human-readable explanation, surfaced to the API/UI. */
  reason: string
}

/** Every provider adapter normalizes its own wire format down to this shape. */
export type EmailVerifier = (email: string) => Promise<EmailVerificationResult>

const PROVIDER_NAME = 'mock-verifier'

/** Same shape as the frontend check, kept intentionally simple. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Mock provider preserving the original business rules (known-bad `john.doe`
 * addresses and plus-addressing are rejected) minus the artificial latency.
 *
 * Suggestions for making this a real integration are tracked in the PR notes:
 * the sleep was almost certainly a stand-in for network latency, so a real
 * provider should keep the bounded activity timeout and retry policy that now
 * wrap this call, and additionally honour provider rate limits.
 */
export const verifyEmailWithMockProvider: EmailVerifier = async (email) => {
  const normalized = email?.trim().toLowerCase() ?? ''

  if (!normalized) {
    return { status: 'invalid', provider: PROVIDER_NAME, reason: 'Email is empty' }
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return { status: 'invalid', provider: PROVIDER_NAME, reason: 'Email is not syntactically valid' }
  }

  if (normalized.includes('john.doe')) {
    return { status: 'invalid', provider: PROVIDER_NAME, reason: 'Address is a known placeholder' }
  }

  if (normalized.includes('+')) {
    return {
      status: 'invalid',
      provider: PROVIDER_NAME,
      reason: 'Plus-addressed aliases are not accepted',
    }
  }

  return { status: 'valid', provider: PROVIDER_NAME, reason: 'Address accepted by provider' }
}
