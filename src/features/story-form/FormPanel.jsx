import React, { useState } from 'react'
import { PhotoSection } from '@/features/photos/PhotoSection'
import { AiPromptModal } from '@/features/ai-generate/AiPromptModal'
import { DateSelect } from './DateSelect'
import { ThemePicker } from './ThemePicker'

export function FormPanel({ form, onChange, autoNarrativeSize = 13 }) {
  const [aiModalOpen, setAiModalOpen] = useState(false)
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
          <DateSelect value={form.date} onChange={v => onChange('date', v)} />
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
        <button type="button" className="btn-upload ai-generate-btn" onClick={() => setAiModalOpen(true)}>
          Generate with AI
        </button>
        <div className="narrative-divider">or write it yourself</div>
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
        <ThemePicker value={form.theme} onChange={t => onChange('theme', t)} />
      </section>
    </div>
  )
}
