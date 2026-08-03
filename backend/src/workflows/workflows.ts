import { proxyActivities } from '@temporalio/workflow'
import type * as activities from './activities'
import type { EmailVerificationResult } from './activities/providers/emailVerifier'

/**
 * The original config used a 1 second `startToCloseTimeout` with Temporal's
 * default retry policy, which has no `maximumAttempts`. A provider slower than
 * 1s therefore timed out and was retried forever, so `workflow.execute` never
 * settled and the HTTP request hung with no success or failure reported.
 *
 * Fix: give the activity a realistic timeout and a bounded retry policy, so a
 * persistently slow/failing provider surfaces as an error instead of a hang.
 */
const { verifyEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: {
    initialInterval: '500 milliseconds',
    backoffCoefficient: 2,
    maximumInterval: '2 seconds',
    maximumAttempts: 3,
  },
})

export async function verifyEmailWorkflow(email: string): Promise<EmailVerificationResult> {
  return await verifyEmail(email)
}
