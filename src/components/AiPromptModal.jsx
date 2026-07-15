import React, { useState } from 'react'
import { AI_SURVEY_QUESTIONS, buildAiPrompt, buildAiLinks } from '../utils/aiPrompt'

export function AiPromptModal({ onClose }) {
  const [answers, setAnswers] = useState({})
  const [copied, setCopied] = useState(false)

  const prompt = buildAiPrompt(answers)
  const links = buildAiLinks(prompt)

  const setAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
    setCopied(false)
  }

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API unavailable — the prompt preview below can be copied manually
    }
  }

  return (
    <div className="crop-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>Generate Narrative with AI</h3>
          <p>Answer a few quick questions, then open your assistant of choice with a ready-made prompt.</p>
        </div>

        <div className="ai-modal-questions">
          {AI_SURVEY_QUESTIONS.map(q => (
            <label key={q.key} className="form-label">
              {q.label}
              <textarea
                className="form-textarea"
                rows={2}
                value={answers[q.key] || ''}
                onChange={e => setAnswer(q.key, e.target.value)}
                placeholder={q.placeholder}
              />
            </label>
          ))}
        </div>

        <div className="ai-modal-prompt">
          <div className="ai-modal-prompt-label">Prompt preview</div>
          <textarea className="form-textarea ai-modal-prompt-text" rows={5} value={prompt} readOnly />
        </div>

        <div className="ai-modal-links">
          <a className="btn-primary-sm" href={links.chatgpt} target="_blank" rel="noopener noreferrer">
            Generate with ChatGPT
          </a>
          <a className="btn-primary-sm" href={links.claude} target="_blank" rel="noopener noreferrer">
            Generate with Claude
          </a>
          <a className="btn-primary-sm" href={links.copilot} target="_blank" rel="noopener noreferrer">
            Generate with Copilot
          </a>
        </div>

        <div className="crop-btn-row">
          <button type="button" className="btn-ghost" onClick={copyPrompt}>
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
          <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
