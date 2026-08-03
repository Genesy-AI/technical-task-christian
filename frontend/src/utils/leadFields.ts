/**
 * Single source of truth for lead field presentation.
 *
 * The field list is expected to keep growing, so the leads table and the message
 * composer both derive their UI from this registry rather than hardcoding columns
 * and template chips. Adding a field here surfaces it in both places at once.
 *
 * Trade-off: this mirrors the backend's `TEMPLATE_FIELDS` registry. Sharing one
 * module would need a shared workspace package, which is out of scope here, so the
 * two lists must be kept in sync by hand — see IMPROVEMENTS.md.
 */

/** Groups exist so the composer can stay readable as the field count grows. */
export type LeadFieldGroup = 'Person' | 'Company' | 'Contact'

export interface LeadFieldDefinition {
  /** Matches both the API payload key and the `{token}` used in templates. */
  key: string
  label: string
  group: LeadFieldGroup
  /** Whether the field can be referenced from a message template. */
  templatable: boolean
}

export const LEAD_FIELDS: readonly LeadFieldDefinition[] = [
  { key: 'firstName', label: 'First Name', group: 'Person', templatable: true },
  { key: 'lastName', label: 'Last Name', group: 'Person', templatable: true },
  { key: 'jobTitle', label: 'Job Title', group: 'Person', templatable: true },
  { key: 'yearsAtCompany', label: 'Years at Company', group: 'Person', templatable: true },
  { key: 'companyName', label: 'Company', group: 'Company', templatable: true },
  { key: 'countryCode', label: 'Country', group: 'Company', templatable: true },
  { key: 'email', label: 'Email', group: 'Contact', templatable: true },
  { key: 'phone', label: 'Phone', group: 'Contact', templatable: true },
  { key: 'linkedin', label: 'LinkedIn', group: 'Contact', templatable: true },
]

export const TEMPLATABLE_LEAD_FIELDS = LEAD_FIELDS.filter((field) => field.templatable)

/** Stable group ordering for the composer, derived from the registry itself. */
export const LEAD_FIELD_GROUPS = TEMPLATABLE_LEAD_FIELDS.reduce<LeadFieldGroup[]>((groups, field) => {
  if (!groups.includes(field.group)) {
    groups.push(field.group)
  }
  return groups
}, [])
