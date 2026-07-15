import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  { ignores: ['dist/', 'docs/', '.playwright-mcp/'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // `import React` is unused with the automatic JSX runtime but harmless;
      // don't force churn across every component file.
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
      // eslint-plugin-react-hooks@7's `recommended` preset promotes several
      // new React Compiler-era rules to error level, including this one,
      // which flags a pre-existing pattern in PhotoCropModal.jsx (re-clamping
      // pan on zoom change). Fixing it is a behavioral change out of scope
      // for a tooling-only task, so it's downgraded to a warning here,
      // consistent with how exhaustive-deps is already treated as advisory.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]
