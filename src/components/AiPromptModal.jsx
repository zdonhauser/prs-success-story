import React, { useState } from 'react'
import { AI_SURVEY_QUESTIONS, buildAiPrompt, buildAiLinks } from '../utils/aiPrompt'

// Installed (home-screen / standalone) PWAs open target="_blank" links in
// an embedded in-app browser sheet, not full Safari — which doesn't share
// Safari's cookies, so the user looks logged out of ChatGPT/Claude/Copilot
// even though they're logged in in Safari proper. Same-window navigation
// (no target) is the best available option to encourage a real hand-off,
// though iOS doesn't guarantee it — a x-safari-https: scheme trick was
// tried here and confirmed broken (Safari refuses it as an invalid
// address), so there's no fully reliable client-side fix; the note below
// tells the user how to escape the in-app view manually if it happens.
const isStandalone =
  typeof window !== 'undefined' &&
  (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches)

export function AiPromptModal({ answers, onAnswersChange, onClose }) {
  const [copied, setCopied] = useState(false)
  const [copilotCopied, setCopilotCopied] = useState(false)

  const prompt = buildAiPrompt(answers)
  const links = buildAiLinks(prompt)
  const linkTargetProps = isStandalone ? {} : { target: '_blank', rel: 'noopener noreferrer' }

  const setAnswer = (key, value) => {
    onAnswersChange({ ...answers, [key]: value })
    setCopied(false)
  }

  const copyToClipboard = async (onDone) => {
    try {
      await navigator.clipboard.writeText(prompt)
      onDone()
    } catch {
      // clipboard API unavailable — the prompt preview below can be copied manually
    }
  }

  const copyPrompt = () => copyToClipboard(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  })

  const copyForCopilot = () => copyToClipboard(() => {
    setCopilotCopied(true)
    setTimeout(() => setCopilotCopied(false), 4000)
  })

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
          <a className="btn-primary-sm" href={links.chatgpt} {...linkTargetProps}>
            Generate with ChatGPT
          </a>
          <a className="btn-primary-sm" href={links.claude} {...linkTargetProps}>
            Generate with Claude
          </a>
          <a className="btn-primary-sm" href={links.copilot} {...linkTargetProps} onClick={copyForCopilot}>
            {copilotCopied ? 'Copied — paste it into Copilot' : 'Generate with Copilot'}
          </a>
          <p className="ai-modal-copilot-note">
            Copilot doesn't support pre-filled prompts, so this copies the prompt to your clipboard — paste it in once Copilot opens.
          </p>
          {isStandalone && (
            <p className="ai-modal-copilot-note">
              If this opens inside the app instead of Safari and you're not logged in, tap the Share or ••• icon in that window and choose "Open in Safari."
            </p>
          )}
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
