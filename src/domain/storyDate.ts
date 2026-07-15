// Story dates are stored as 'YYYY-MM'. Either part may be empty while the
// user is mid-selection (the month/year selects are independent), so
// partial values like '-05' or '2026-' are legal in the form state and
// every consumer must tolerate them.

export function thisMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function splitDate(value: string | null | undefined): { year: string; month: string } {
  const [year = '', month = ''] = value ? value.split('-') : []
  return { year, month }
}

export function joinDateParts(year: string, month: string): string {
  return (year || month) ? `${year}-${month}` : ''
}

export function formatDisplayDate(value: string | null | undefined): string {
  if (!value) return 'Month Year'
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return 'Month Year' // partial selection
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
