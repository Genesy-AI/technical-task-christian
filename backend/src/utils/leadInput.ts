/**
 * Normalization helpers for untrusted lead input arriving from the bulk import API.
 *
 * Keeping these separate from the route handler makes them unit-testable and keeps
 * the coercion rules in one place as the field list grows.
 */

/** Trims a value and collapses blank strings to null so the DB stores null, not ''. */
export const optionalString = (raw: unknown): string | null => {
  if (typeof raw !== 'string') {
    return raw === null || raw === undefined ? null : String(raw).trim() || null
  }

  return raw.trim() || null
}

export interface NormalizedNumber {
  value: number | null
  /** Present only when a non-empty value was rejected. */
  warning?: string
}

/** Upper bound is a sanity check, not a business rule: nobody has a 100-year tenure. */
const MAX_YEARS_AT_COMPANY = 100

/**
 * `yearsAtCompany` arrives as a CSV string. Accepts whole, non-negative numbers;
 * anything else is dropped with a warning rather than failing the whole import,
 * mirroring how invalid country codes are handled.
 */
export const normalizeYearsAtCompany = (raw: unknown): NormalizedNumber => {
  if (raw === null || raw === undefined || raw === '') {
    return { value: null }
  }

  const asString = String(raw).trim()

  if (!asString) {
    return { value: null }
  }

  const parsed = Number(asString)

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_YEARS_AT_COMPANY) {
    return {
      value: null,
      warning: `Invalid years at company "${asString}" was ignored`,
    }
  }

  return { value: parsed }
}
