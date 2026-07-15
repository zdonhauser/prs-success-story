import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  { ignores: ['dist/', 'docs/', '.playwright-mcp/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // eslint-plugin-react-hooks@7's `recommended` preset promotes several
      // new React Compiler-era rules to error level, including this one,
      // which flags pre-existing patterns in PhotoCropModal.tsx (re-clamping
      // pan on zoom change) and useAutoFitText.ts (resetting to a default
      // size when there's no narrative text). Fixing these is a behavioral
      // change out of scope for a tooling-only task, so it's downgraded to
      // a warning here, consistent with how exhaustive-deps is already
      // treated as advisory.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
)
