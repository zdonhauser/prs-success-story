import { themes, themeSwatch } from '@/config/themes'

export function ThemePicker({ value, onChange }) {
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
