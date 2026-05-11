import React from 'react'
import { PhotoSection } from './PhotoSection'
import { themes, themeSwatch } from '../utils/themes'

export function FormPanel({ form, onChange }) {
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
          <input
            type="month"
            className="form-input"
            value={form.date}
            onChange={e => onChange('date', e.target.value)}
          />
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
      </section>

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
