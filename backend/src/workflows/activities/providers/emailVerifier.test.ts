import { describe, expect, it } from 'vitest'
import { verifyEmailWithMockProvider } from './emailVerifier'

describe('verifyEmailWithMockProvider', () => {
  it('accepts a normal address', async () => {
    const result = await verifyEmailWithMockProvider('ada.lovelace@example.com')

    expect(result.status).toBe('valid')
    expect(result.provider).toBe('mock-verifier')
  })

  it('rejects known placeholder addresses', async () => {
    const result = await verifyEmailWithMockProvider('john.doe@example.com')

    expect(result.status).toBe('invalid')
  })

  it('rejects plus-addressed aliases', async () => {
    const result = await verifyEmailWithMockProvider('ada+spam@example.com')

    expect(result.status).toBe('invalid')
  })

  it('rejects syntactically invalid addresses', async () => {
    const result = await verifyEmailWithMockProvider('not-an-email')

    expect(result.status).toBe('invalid')
  })

  it('rejects empty input', async () => {
    const result = await verifyEmailWithMockProvider('')

    expect(result.status).toBe('invalid')
  })

  it('is case-insensitive about the placeholder rule', async () => {
    const result = await verifyEmailWithMockProvider('John.Doe@Example.com')

    expect(result.status).toBe('invalid')
  })

  // Regression guard for the original bug: this address used to sleep for 20s,
  // which blew the 1s activity timeout and retried forever.
  it('returns promptly for the address that used to hang', async () => {
    const startedAt = process.hrtime.bigint()
    const result = await verifyEmailWithMockProvider('jane.smith@example.com')
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    expect(result.status).toBe('valid')
    expect(elapsedMs).toBeLessThan(1000)
  })
})
