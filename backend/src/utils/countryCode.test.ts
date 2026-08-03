import { describe, it, expect } from 'vitest'
import { normalizeCountryCode } from './countryCode'

describe('normalizeCountryCode', () => {
  it('should return null without a warning for empty or missing values', () => {
    expect(normalizeCountryCode(undefined)).toEqual({ code: null })
    expect(normalizeCountryCode(null)).toEqual({ code: null })
    expect(normalizeCountryCode('')).toEqual({ code: null })
    expect(normalizeCountryCode('   ')).toEqual({ code: null })
  })

  it('should accept valid alpha-2 codes, including exotic ones', () => {
    expect(normalizeCountryCode('US')).toEqual({ code: 'US' })
    expect(normalizeCountryCode('TV')).toEqual({ code: 'TV' })
    expect(normalizeCountryCode('BT')).toEqual({ code: 'BT' })
    expect(normalizeCountryCode('KP')).toEqual({ code: 'KP' })
    expect(normalizeCountryCode('SM')).toEqual({ code: 'SM' })
    expect(normalizeCountryCode('PW')).toEqual({ code: 'PW' })
    expect(normalizeCountryCode('KI')).toEqual({ code: 'KI' })
    expect(normalizeCountryCode('TO')).toEqual({ code: 'TO' })
    expect(normalizeCountryCode('HR')).toEqual({ code: 'HR' })
    expect(normalizeCountryCode('AO')).toEqual({ code: 'AO' })
  })

  it('should trim and upper-case valid codes', () => {
    expect(normalizeCountryCode('es')).toEqual({ code: 'ES' })
    expect(normalizeCountryCode(' fr ')).toEqual({ code: 'FR' })
  })

  it('should reject codes that are not two letters', () => {
    expect(normalizeCountryCode('XXX')).toEqual({
      code: null,
      warning: 'Invalid country code "XXX" was ignored',
    })
    expect(normalizeCountryCode('12')).toEqual({
      code: null,
      warning: 'Invalid country code "12" was ignored',
    })
    expect(normalizeCountryCode('U')).toEqual({
      code: null,
      warning: 'Invalid country code "U" was ignored',
    })
  })

  it('should reject unknown two-letter codes regardless of casing', () => {
    expect(normalizeCountryCode('xx')).toEqual({
      code: null,
      warning: 'Invalid country code "xx" was ignored',
    })
    expect(normalizeCountryCode('XX')).toEqual({
      code: null,
      warning: 'Invalid country code "XX" was ignored',
    })
  })

  it('should reject the ZZ unknown-region placeholder', () => {
    expect(normalizeCountryCode('ZZ')).toEqual({
      code: null,
      warning: 'Invalid country code "ZZ" was ignored',
    })
  })

  it('should accept legacy aliases resolved by ICU (documented trade-off)', () => {
    expect(normalizeCountryCode('UK')).toEqual({ code: 'UK' })
  })
})
