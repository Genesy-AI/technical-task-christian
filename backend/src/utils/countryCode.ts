/**
 * Trade-off: this file is intentionally duplicated in
 * `frontend/src/utils/countryCode.ts`. Frontend and backend are separate packages
 * with no shared workspace module, and the backend must not trust client-side
 * validation. Extracting a shared package is the follow-up if more rules appear.
 */

export interface CountryCodeResult {
  /** Valid, upper-cased ISO 3166-1 alpha-2 code, or null when absent/invalid. */
  code: string | null
  /** Present only when a non-empty value was rejected. */
  warning?: string
}

const ALPHA2_PATTERN = /^[A-Z]{2}$/

/** Documented placeholder for "unknown region"; ICU resolves it, but it is not a real country. */
const UNKNOWN_REGION_CODE = 'ZZ'

/**
 * Trade-off: we validate against the runtime's ICU region data (`Intl.DisplayNames`)
 * instead of hand-maintaining an ISO 3166-1 list. This keeps the check tiny and
 * always current, at the cost of also accepting legacy/exceptional aliases such as
 * `UK` (-> United Kingdom). That is acceptable here: the goal is to reject garbled
 * input like `XXX` or `12`, not to enforce a strict canonical registry.
 */
const regionNames = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' })

const isKnownRegion = (candidate: string): boolean => {
  try {
    // `Intl.DisplayNames#of` throws RangeError on structurally invalid input
    // (e.g. 'XXX', '12'), so ALPHA2_PATTERN must be checked first. The try/catch
    // stays as defence in depth so a bad cell can never break the whole import.
    return regionNames.of(candidate) !== undefined
  } catch {
    return false
  }
}

/**
 * Normalizes a raw CSV country cell.
 * Empty/missing values are not an error: `countryCode` is optional.
 */
export const normalizeCountryCode = (raw?: string | null): CountryCodeResult => {
  const trimmed = raw?.trim() ?? ''

  if (!trimmed) {
    return { code: null }
  }

  const candidate = trimmed.toUpperCase()

  if (!ALPHA2_PATTERN.test(candidate) || candidate === UNKNOWN_REGION_CODE || !isKnownRegion(candidate)) {
    return { code: null, warning: `Invalid country code "${trimmed}" was ignored` }
  }

  return { code: candidate }
}
