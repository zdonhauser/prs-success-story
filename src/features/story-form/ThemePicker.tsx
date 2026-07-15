import { themes, themeSwatch, type ThemeId } from '@/config/themes'

interface ThemePickerProps {
  value: string
  onChange: (theme: ThemeId) => void
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="theme-grid">
      {themes.map(t => {
        const [primary, accent] = themeSwatch[t.id]
        return (
          <button
            key={t.id}
            className={`theme-btn ${value === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            <div className="theme-swatch">
              <div style={{ background: primary, flex: 1 }} />
              <div style={{ background: accent, width: '30%' }} />
            </div>
            <span>{t.name}</span>
          </button>
        )
      })}
    </div>
  )
}
