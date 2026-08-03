export type LeadsVerifyEmailsInput = {
  leadIds: number[]
}

/** `unknown` = the provider could not decide (transient failure), not "invalid". */
export type EmailVerificationStatus = 'valid' | 'invalid' | 'unknown'

export type LeadsVerifyEmailsOutput = {
  success: boolean
  verifiedCount: number
  results: Array<{
    leadId: number
    emailVerified: boolean | null
    status: EmailVerificationStatus
    reason: string
  }>
  errors: Array<{
    leadId: number
    leadName: string
    error: string
  }>
}
