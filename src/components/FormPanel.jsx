import React, { useState } from 'react'
import { PhotoSection } from './PhotoSection'
import { AiPromptModal } from './AiPromptModal'
import { themes, themeSwatch } from '../utils/themes'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function currentYear() {
  return new Date().getFullYear()
}

export function FormPanel({ form, onChange, autoNarrativeSize = 13 }) {
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [selYear, selMonth] = form.date ? form.date.split('-') : ['', '']
  const years = []
  const startYear = currentYear() - 2
  for (let y = startYear; y <= startYear + 6; y++) years.push(y)

  const setDatePart = (part, value) => {
    const y = part === 'year' ? value : (selYear || '')
    const m = part === 'month' ? value : (selMonth || '')
    onChange('date', (y || m) ? `${y}-${m}` : '')
  }

  const effectiveSize = form.narrativeFontSize ?? autoNarrativeSize

  return (
    <div className="form-panel">
      <section className="form-section">
        <h2>Story Details</h2>
        <label className="form-label">
          Community
          <input
            type="text"
            className="form-input"
            value={form.community}
            onChange={e => onChange('community', e.target.value)}
            placeholder="Community name"
          />
        </label>
        <label className="form-label">
          Coordinator
          <input
            type="text"
            className="form-input"
            value={form.coordinator}
            onChange={e => onChange('coordinator', e.target.value)}
            placeholder="Your name"
          />
        </label>
        <label className="form-label">
          Date
          <div className="form-date-row">
            <select
              className="form-input"
              value={selMonth}
              onChange={e => setDatePart('month', e.target.value)}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
              ))}
            </select>
            <select
              className="form-input"
              value={selYear}
              onChange={e => setDatePart('year', e.target.value)}
            >
              <option value="">Year</option>
              {years.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </label>
      </section>

      <PhotoSection
        photos={form.photos}
        layoutIndex={form.photoLayoutIndex}
        onPhotosChange={p => onChange('photos', p)}
        onLayoutChange={i => onChange('photoLayoutIndex', i)}
      />

      <section className="form-section">
        <h2>Narrative</h2>
        <textarea
          className="form-textarea"
          value={form.narrative}
          onChange={e => onChange('narrative', e.target.value)}
          placeholder="Share what happened — who was involved, what took place, and the impact on the community."
          rows={10}
        />
        <div className="text-size-row">
          <span>Text Size</span>
          <input
            type="range"
            min="11" max="26" step="1"
            value={effectiveSize}
            onChange={e => onChange('narrativeFontSize', parseInt(e.target.value, 10))}
          />
          <span className="text-size-val">{effectiveSize}px</span>
          {form.narrativeFontSize != null && (
            <button type="button" className="btn-ghost text-size-auto" onClick={() => onChange('narrativeFontSize', null)}>
              Auto
            </button>
          )}
        </div>
        <button type="button" className="btn-upload ai-generate-btn" onClick={() => setAiModalOpen(true)}>
          Generate with AI
        </button>
      </section>

      {aiModalOpen && (
        <AiPromptModal
          answers={form.aiAnswers}
          onAnswersChange={answers => onChange('aiAnswers', answers)}
          onClose={() => setAiModalOpen(false)}
        />
      )}

      <section className="form-section">
        <h2>Style</h2>
        <div className="theme-grid">
          {themes.map(t => {
            const [primary, accent] = themeSwatch[t.id]
            return (
              <button
                key={t.id}
                className={`theme-btn ${form.theme === t.id ? 'active' : ''}`}
                onClick={() => onChange('theme', t.id)}
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
      </section>
    </div>
  )
}
