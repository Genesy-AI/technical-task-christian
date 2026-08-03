import { describe, it, expect } from 'vitest'
import { parseCsv, isValidEmail } from './csvParser'

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('first.last+tag@example.org')).toBe(true)
    expect(isValidEmail('123@456.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('test.example.com')).toBe(false)
    expect(isValidEmail('test@.com')).toBe(false)
    expect(isValidEmail('test@example')).toBe(false)
  })
})

describe('parseCsv', () => {
  it('should throw error for empty content', () => {
    expect(() => parseCsv('')).toThrow('CSV content cannot be empty')
    expect(() => parseCsv('   ')).toThrow('CSV content cannot be empty')
  })

  it('should throw error for CSV with only headers', () => {
    const csv = 'firstName,lastName,email'
    expect(() => parseCsv(csv)).toThrow('CSV file appears to be empty or contains no valid data')
  })

  it('should throw error for malformed CSV content', () => {
    const malformedCsv = `firstName,lastName,email
"John,Doe,john@example.com,extra"field`
    expect(() => parseCsv(malformedCsv)).toThrow('CSV parsing failed')
  })

  it('should throw error for CSV with mismatched field count', () => {
    const mismatchedCsv = `firstName,lastName,email
John,Doe,john@example.com,ExtraField,AnotherExtra
Jane,Smith`
    expect(() => parseCsv(mismatchedCsv)).toThrow('CSV parsing failed')
  })

  it('should throw error for CSV with critical delimiter issues', () => {
    const noDelimiterCsv = `firstName lastName email
John Doe john@example.com`
    expect(() => parseCsv(noDelimiterCsv)).toThrow()
  })

  it('should parse valid CSV with all required fields', () => {
    const csv = `firstName,lastName,email,jobTitle,countryCode,companyName
John,Doe,john.doe@example.com,Developer,US,Tech Corp`

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      jobTitle: 'Developer',
      countryCode: 'US',
      companyName: 'Tech Corp',
      isValid: true,
      errors: [],
      warnings: [],
      rowIndex: 2,
    })
  })

  it('should handle missing required fields and mark as invalid', () => {
    const csv = `firstName,lastName,email
,Smith,john@example.com
John,,john@example.com
John,Smith,`

    const result = parseCsv(csv)

    expect(result).toHaveLength(3)

    expect(result[0].isValid).toBe(false)
    expect(result[0].errors).toContain('First name is required')

    expect(result[1].isValid).toBe(false)
    expect(result[1].errors).toContain('Last name is required')

    expect(result[2].isValid).toBe(false)
    expect(result[2].errors).toContain('Email is required')
  })

  it('should validate email format', () => {
    const csv = `firstName,lastName,email
John,Doe,invalid-email
Jane,Smith,jane@example.com`

    const result = parseCsv(csv)

    expect(result).toHaveLength(2)
    expect(result[0].isValid).toBe(false)
    expect(result[0].errors).toContain('Invalid email format')
    expect(result[1].isValid).toBe(true)
  })

  it('should handle CSV with quoted values', () => {
    const csv = `firstName,lastName,email,jobTitle
"John","Doe","john.doe@example.com","Software Engineer"`

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('John')
    expect(result[0].lastName).toBe('Doe')
    expect(result[0].email).toBe('john.doe@example.com')
    expect(result[0].jobTitle).toBe('Software Engineer')
  })

  it('should skip empty rows', () => {
    const csv = `firstName,lastName,email
John,Doe,john@example.com
,,
Jane,Smith,jane@example.com`

    const result = parseCsv(csv)

    expect(result).toHaveLength(2)
    expect(result[0].firstName).toBe('John')
    expect(result[1].firstName).toBe('Jane')
  })

  it('should handle case-insensitive headers', () => {
    const csv = `FIRSTNAME,LASTNAME,EMAIL,JOBTITLE,COUNTRYCODE,COMPANYNAME
John,Doe,john@example.com,Developer,US,Tech Corp`

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('John')
    expect(result[0].lastName).toBe('Doe')
    expect(result[0].email).toBe('john@example.com')
    expect(result[0].jobTitle).toBe('Developer')
  })

  it('should handle missing optional fields', () => {
    const csv = `firstName,lastName,email,jobTitle,countryCode
John,Doe,john@example.com,,`

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].jobTitle).toBeUndefined()
    expect(result[0].countryCode).toBeUndefined()
    expect(result[0].isValid).toBe(true)
  })

  it('should preserve row index correctly', () => {
    const csv = `firstName,lastName,email
John,Doe,john@example.com
Jane,Smith,jane@example.com
Bob,Johnson,bob@example.com`

    const result = parseCsv(csv)

    expect(result).toHaveLength(3)
    expect(result[0].rowIndex).toBe(2)
    expect(result[1].rowIndex).toBe(3)
    expect(result[2].rowIndex).toBe(4)
  })

  it('should handle multiple validation errors per lead', () => {
    const csv = `firstName,lastName,email
 , ,invalid-email`

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].isValid).toBe(false)
    expect(result[0].errors).toHaveLength(3)
    expect(result[0].errors).toContain('First name is required')
    expect(result[0].errors).toContain('Last name is required')
    expect(result[0].errors).toContain('Invalid email format')
  })

  it('should handle extra columns not in header mapping', () => {
    const csv = `firstName,lastName,email,unknownColumn
John,Doe,john@example.com,someValue`

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('John')
    expect(result[0].lastName).toBe('Doe')
    expect(result[0].email).toBe('john@example.com')
    expect(result[0].isValid).toBe(true)
  })

  it('should handle mixed valid and invalid leads', () => {
    const csv = `firstName,lastName,email
John,Doe,john@example.com
,Smith,invalid-email
Jane,Johnson,jane@example.com`

    const result = parseCsv(csv)

    expect(result).toHaveLength(3)
    expect(result[0].isValid).toBe(true)
    expect(result[1].isValid).toBe(false)
    expect(result[1].errors).toContain('First name is required')
    expect(result[1].errors).toContain('Invalid email format')
    expect(result[2].isValid).toBe(true)
  })

  it('should handle whitespace in fields', () => {
    const csv = `firstName,lastName,email
 John , Doe , john@example.com `

    const result = parseCsv(csv)

    expect(result).toHaveLength(1)
    expect(result[0].firstName).toBe('John')
    expect(result[0].lastName).toBe('Doe')
    expect(result[0].email).toBe('john@example.com')
    expect(result[0].isValid).toBe(true)
  })

  describe('phone, yearsAtCompany and linkedin', () => {
    it('should parse the canonical header names', () => {
      const csv = `firstName,lastName,email,phone,yearsAtCompany,linkedin
John,Doe,john@example.com,+1-555-0100,4,https://www.linkedin.com/in/johndoe`

      const result = parseCsv(csv)

      expect(result[0].phone).toBe('+1-555-0100')
      expect(result[0].yearsAtCompany).toBe(4)
      expect(result[0].linkedin).toBe('https://www.linkedin.com/in/johndoe')
      expect(result[0].isValid).toBe(true)
    })

    // The provided sample CSVs use these names rather than the canonical ones.
    it('should map the phoneNumber and yearsInRole aliases', () => {
      const csv = `firstName,lastName,email,yearsInRole,phoneNumber
John,Doe,john@example.com,2,(731)123-9702`

      const result = parseCsv(csv)

      expect(result[0].phone).toBe('(731)123-9702')
      expect(result[0].yearsAtCompany).toBe(2)
    })

    it('should map linkedin URL aliases', () => {
      const csv = `firstName,lastName,email,linkedInProfileUrl
John,Doe,john@example.com,https://linkedin.com/in/jd`

      const result = parseCsv(csv)

      expect(result[0].linkedin).toBe('https://linkedin.com/in/jd')
    })

    it('should ignore headers it does not recognise', () => {
      const csv = `firstName,lastName,email,favouriteColour
John,Doe,john@example.com,blue`

      const result = parseCsv(csv)

      expect(result[0].isValid).toBe(true)
      expect(result[0]).not.toHaveProperty('favouriteColour')
    })

    it('should keep a tenure of zero', () => {
      const csv = `firstName,lastName,email,yearsAtCompany
John,Doe,john@example.com,0`

      const result = parseCsv(csv)

      expect(result[0].yearsAtCompany).toBe(0)
      expect(result[0].warnings).toHaveLength(0)
    })

    it('should warn and drop an unparseable tenure without invalidating the lead', () => {
      const csv = `firstName,lastName,email,yearsAtCompany
John,Doe,john@example.com,five`

      const result = parseCsv(csv)

      expect(result[0].yearsAtCompany).toBeUndefined()
      expect(result[0].isValid).toBe(true)
      expect(result[0].warnings[0]).toContain('five')
    })

    it('should drop negative and fractional tenures', () => {
      const csv = `firstName,lastName,email,yearsAtCompany
John,Doe,john@example.com,-3
Jane,Doe,jane@example.com,2.5`

      const result = parseCsv(csv)

      expect(result[0].yearsAtCompany).toBeUndefined()
      expect(result[0].warnings).toHaveLength(1)
      expect(result[1].yearsAtCompany).toBeUndefined()
      expect(result[1].warnings).toHaveLength(1)
    })

    it('should leave absent optional fields undefined without warning', () => {
      const csv = `firstName,lastName,email,phone,yearsAtCompany,linkedin
John,Doe,john@example.com,,,`

      const result = parseCsv(csv)

      expect(result[0].phone).toBeUndefined()
      expect(result[0].yearsAtCompany).toBeUndefined()
      expect(result[0].linkedin).toBeUndefined()
      expect(result[0].warnings).toHaveLength(0)
    })
  })
})
