import { splitDate, joinDateParts } from '@/domain/storyDate'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function yearOptions(): number[] {
  const start = new Date().getFullYear() - 2
  const years: number[] = []
  for (let y = start; y <= start + 6; y++) years.push(y)
  return years
}

interface DateSelectProps {
  value: string
  onChange: (value: string) => void
}

export function DateSelect({ value, onChange }: DateSelectProps) {
  const { year, month } = splitDate(value)

  // Selecting one part must never wipe the other (each select fires
  // independently, so fall back to the current value of the sibling).
  const setPart = (part: 'year' | 'month', v: string) => {
    const y = part === 'year' ? v : year
    const m = part === 'month' ? v : month
    onChange(joinDateParts(y, m))
  }

  return (
    <div className="form-date-row">
      <select className="form-input" value={month} onChange={e => setPart('month', e.target.value)}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
        ))}
      </select>
      <select className="form-input" value={year} onChange={e => setPart('year', e.target.value)}>
        <option value="">Year</option>
        {yearOptions().map(y => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>
    </div>
  )
}
