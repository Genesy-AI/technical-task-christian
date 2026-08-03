import { isTemplateField, TemplateField } from './leadFields'

export interface Lead {
  firstName: string
  lastName?: string | null
  email?: string | null
  jobTitle?: string | null
  companyName?: string | null
  countryCode?: string | null
  phone?: string | null
  yearsAtCompany?: number | null
  linkedin?: string | null
}

/**
 * Values are stringified at the edge so numeric fields such as `yearsAtCompany`
 * interpolate correctly. `0` is a legitimate value and must not be treated as missing.
 */
const readField = (lead: Lead, field: TemplateField): string | null => {
  const value = lead[field]

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

export function generateMessageFromTemplate(template: string, lead: Lead): string {
  let message = template

  const templateVariables = template.match(/\{(\w+)\}/g) || []

  for (const variable of templateVariables) {
    const fieldName = variable.slice(1, -1)

    if (!isTemplateField(fieldName)) {
      throw new Error(`Unknown field in template: ${fieldName}`)
    }

    const fieldValue = readField(lead, fieldName)

    if (fieldValue === null) {
      throw new Error(`Missing required field: ${fieldName}`)
    }

    message = message.replace(new RegExp(`\\{${fieldName}\\}`, 'g'), fieldValue)
  }

  return message
}
