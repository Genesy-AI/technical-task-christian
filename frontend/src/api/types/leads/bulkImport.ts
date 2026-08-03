export interface LeadsBulkImportInput {
  leads: {
    firstName: string
    lastName: string
    email: string
    jobTitle?: string
    countryCode?: string
    companyName?: string
    phone?: string
    yearsAtCompany?: number
    linkedin?: string
  }[]
}

export interface LeadsBulkImportOutput {
  success: boolean
  importedCount: number
  duplicatesSkipped: number
  invalidLeads: number
  errors: Array<{
    lead: any
    error: string
  }>
  /** Non-blocking issues (e.g. an unparseable tenure was dropped); the lead still imported. */
  warnings: Array<{
    lead: unknown
    warning: string
  }>
}
