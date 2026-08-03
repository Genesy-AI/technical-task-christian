import { EmailVerificationResult, verifyEmailWithMockProvider } from './providers/emailVerifier'

/**
 * Activity wrapper around the configured email verification provider.
 *
 * Kept thin on purpose: timeouts and the retry policy live in the workflow
 * (see `verifyEmailWorkflow`) so a slow or flaky provider can never hang the
 * caller indefinitely, which was the original bug.
 */
export async function verifyEmail(email: string): Promise<EmailVerificationResult> {
  return verifyEmailWithMockProvider(email)
}
