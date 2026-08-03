import { describe, expect, it } from 'vitest'
import { normalizeYearsAtCompany, optionalString } from './leadInput'

describe('optionalString', () => {
  it('trims surrounding whitespace', () => {
    expect(optionalString('  +1-555-0100  ')).toBe('+1-555-0100')
  })

  it('collapses blank strings to null', () => {
    expect(optionalString('   ')).toBeNull()
    expect(optionalString('')).toBeNull()
  })

  it('maps null and undefined to null', () => {
    expect(optionalString(null)).toBeNull()
    expect(optionalString(undefined)).toBeNull()
  })

  it('stringifies non-string scalars', () => {
    expect(optionalString(1234)).toBe('1234')
  })
})

describe('normalizeYearsAtCompany', () => {
  it('parses whole numbers', () => {
    expect(normalizeYearsAtCompany('5')).toEqual({ value: 5 })
    expect(normalizeYearsAtCompany(10)).toEqual({ value: 10 })
  })

  it('accepts zero as a real value', () => {
    expect(normalizeYearsAtCompany('0')).toEqual({ value: 0 })
  })

  it('treats missing values as absent, not invalid', () => {
    expect(normalizeYearsAtCompany('')).toEqual({ value: null })
    expect(normalizeYearsAtCompany(null)).toEqual({ value: null })
    expect(normalizeYearsAtCompany(undefined)).toEqual({ value: null })
  })

  it('rejects non-numeric text with a warning', () => {
    const result = normalizeYearsAtCompany('five')

    expect(result.value).toBeNull()
    expect(result.warning).toContain('five')
  })

  it('rejects negative and fractional values', () => {
    expect(normalizeYearsAtCompany('-2').value).toBeNull()
    expect(normalizeYearsAtCompany('2.5').value).toBeNull()
  })

  it('rejects implausibly large tenures', () => {
    expect(normalizeYearsAtCompany('500').value).toBeNull()
  })
})
