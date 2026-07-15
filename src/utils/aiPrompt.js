// Placeholder survey + prompt template for the "Generate with AI" flow.
// Intentionally simple — questions and wording are expected to be tuned later.
export const AI_SURVEY_QUESTIONS = [
  {
    key: 'what',
    label: 'What happened?',
    placeholder: 'e.g. We hosted a community cleanup and resource fair in the courtyard.',
  },
  {
    key: 'who',
    label: 'Who was involved?',
    placeholder: 'e.g. 40 residents, the leasing team, and two local nonprofit partners.',
  },
  {
    key: 'impact',
    label: 'What impact did it have?',
    placeholder: 'e.g. Residents met neighbors for the first time and connected with local food and job resources.',
  },
]

export function buildAiPrompt(answers) {
  const get = (key) => (answers[key] || '').trim() || '(not specified)'
  return `You are writing a short "Good Neighbor Program Success Story" for Portfolio Resident Services (PRS), a company that provides supportive services for affordable housing communities. Using the details below, write a warm, specific narrative of 2-3 short paragraphs (about 150-250 words) suitable for a printed one-page success story. Write in third person, past tense, and focus on the impact on residents. Do not include a title, headers, or any commentary — just the narrative text.

What happened: ${get('what')}
Who was involved: ${get('who')}
Impact on the community: ${get('impact')}`
}

export function buildAiLinks(prompt) {
  const q = encodeURIComponent(prompt)
  return {
    chatgpt: `https://chat.openai.com/?q=${q}`,
    claude: `https://claude.ai/new?q=${q}`,
    copilot: `https://copilot.microsoft.com/?q=${q}`,
  }
}
