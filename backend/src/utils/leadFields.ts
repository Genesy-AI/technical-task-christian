/**
 * Single source of truth for the lead fields usable in message templates.
 *
 * The field list is expected to keep growing, so message generation reads from
 * this registry instead of repeating a hardcoded list. Adding a field here makes
 * it templatable everywhere at once.
 */

/** Fields a user may reference as `{field}` in a message template. */
export const TEMPLATE_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'jobTitle',
  'companyName',
  'countryCode',
  'phone',
  'yearsAtCompany',
  'linkedin',
] as const

export type TemplateField = (typeof TEMPLATE_FIELDS)[number]

const TEMPLATE_FIELD_SET: ReadonlySet<string> = new Set(TEMPLATE_FIELDS)

export const isTemplateField = (field: string): field is TemplateField => TEMPLATE_FIELD_SET.has(field)
