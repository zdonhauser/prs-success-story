import { describe, it, expect } from 'vitest'
import { thisMonth, splitDate, joinDateParts, formatDisplayDate } from './storyDate'

describe('thisMonth', () => {
  it('returns YYYY-MM with a zero-padded month', () => {
    expect(thisMonth()).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
  })
})

describe('splitDate / joinDateParts', () => {
  it('round-trips a full date', () => {
    expect(splitDate('2026-07')).toEqual({ year: '2026', month: '07' })
    expect(joinDateParts('2026', '07')).toBe('2026-07')
  })

  it('handles partial selections without dropping the chosen part', () => {
    expect(splitDate('-05')).toEqual({ year: '', month: '05' })
    expect(joinDateParts('', '05')).toBe('-05')
    expect(joinDateParts('2026', '')).toBe('2026-')
  })

  it('returns empty for nothing selected', () => {
    expect(splitDate('')).toEqual({ year: '', month: '' })
    expect(joinDateParts('', '')).toBe('')
  })
})

describe('formatDisplayDate', () => {
  it('formats a complete date', () => {
    expect(formatDisplayDate('2026-07')).toBe('July 2026')
  })

  it('falls back to the placeholder for empty or partial values', () => {
    expect(formatDisplayDate('')).toBe('Month Year')
    expect(formatDisplayDate(null)).toBe('Month Year')
    expect(formatDisplayDate('-05')).toBe('Month Year')
    expect(formatDisplayDate('2026-')).toBe('Month Year')
  })
})
