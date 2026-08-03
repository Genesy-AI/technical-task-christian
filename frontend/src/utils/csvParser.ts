import Papa from 'papaparse'

export interface CsvLead {
  firstName: string
  lastName: string
  email: string
  jobTitle?: string
  countryCode?: string
  companyName?: string
  phone?: string
  yearsAtCompany?: number
  linkedin?: string
  isValid: boolean
  errors: string[]
  /** Non-blocking issues: the lead still imports (e.g. an unparseable tenure). */
  warnings: string[]
  rowIndex: number
}

/**
 * Maps normalized CSV headers onto lead fields.
 *
 * Real exports disagree on naming, so each field accepts several aliases: the
 * provided sample files use `phoneNumber` and `yearsInRole`. Headers are
 * normalized to lowercase letters only before lookup, so `Phone Number`,
 * `phone_number` and `phoneNumber` all collapse to the same key.
 */
/** Lead fields that come off the CSV as plain strings. */
type CsvStringField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'jobTitle'
  | 'countryCode'
  | 'companyName'
  | 'phone'
  | 'linkedin'

type CsvMappedField = CsvStringField | 'yearsAtCompany'

const HEADER_ALIASES: Record<string, CsvMappedField> = {
  firstname: 'firstName',
  lastname: 'lastName',
  email: 'email',
  jobtitle: 'jobTitle',
  countrycode: 'countryCode',
  companyname: 'companyName',
  phone: 'phone',
  phonenumber: 'phone',
  phoneno: 'phone',
  telephone: 'phone',
  mobile: 'phone',
  yearsatcompany: 'yearsAtCompany',
  yearsinrole: 'yearsAtCompany',
  yearsincompany: 'yearsAtCompany',
  tenure: 'yearsAtCompany',
  linkedin: 'linkedin',
  linkedinurl: 'linkedin',
  linkedinprofile: 'linkedin',
  linkedinprofileurl: 'linkedin',
}

/** Upper bound is a sanity check, mirroring the backend's own validation. */
const MAX_YEARS_AT_COMPANY = 100

interface ParsedYears {
  value?: number
  warning?: string
}

const parseYearsAtCompany = (raw: string): ParsedYears => {
  if (!raw) {
    return {}
  }

  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > MAX_YEARS_AT_COMPANY) {
    return { warning: `Invalid years at company "${raw}" was ignored` }
  }

  return { value: parsed }
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const parseCsv = (content: string): CsvLead[] => {
  if (!content?.trim()) {
    throw new Error('CSV content cannot be empty')
  }

  const parseResult = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim(),
    transformHeader: (header) => header.trim().toLowerCase(),
    quoteChar: '"',
  })

  if (parseResult.errors.length > 0) {
    const criticalErrors = parseResult.errors.filter(
      (error) => error.type === 'Delimiter' || error.type === 'Quotes' || error.type === 'FieldMismatch'
    )
    if (criticalErrors.length > 0) {
      throw new Error(`CSV parsing failed: ${criticalErrors[0].message}`)
    }
  }

  if (!parseResult.data || parseResult.data.length === 0) {
    throw new Error('CSV file appears to be empty or contains no valid data')
  }

  const data: CsvLead[] = []

  parseResult.data.forEach((row, index) => {
    if (Object.values(row).every((value) => !value)) return

    const lead: Partial<CsvLead> = { rowIndex: index + 2 }
    const warnings: string[] = []

    Object.entries(row).forEach(([header, value]) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '')
      const field = HEADER_ALIASES[normalizedHeader]
      const trimmedValue = value?.trim() || ''

      if (!field) return

      switch (field) {
        // Required fields keep empty strings so the validation below can report them.
        case 'firstName':
        case 'lastName':
        case 'email':
          lead[field] = trimmedValue
          break
        case 'yearsAtCompany': {
          const { value: years, warning } = parseYearsAtCompany(trimmedValue)
          lead.yearsAtCompany = years
          if (warning) {
            warnings.push(warning)
          }
          break
        }
        default:
          lead[field] = trimmedValue || undefined
          break
      }
    })

    const errors: string[] = []
    if (!lead.firstName?.trim()) {
      errors.push('First name is required')
    }
    if (!lead.lastName?.trim()) {
      errors.push('Last name is required')
    }
    if (!lead.email?.trim()) {
      errors.push('Email is required')
    } else if (!isValidEmail(lead.email)) {
      errors.push('Invalid email format')
    }

    data.push({
      ...lead,
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      email: lead.email || '',
      isValid: errors.length === 0,
      errors,
      warnings,
    } as CsvLead)
  })

  return data
}
