# PRS Success Story Builder

A builder for PRS Good Neighbor Program "success story" one-pagers. A coordinator fills out a
form, watches a live 8.5x11 preview update as they type, and exports a print-ready PDF. It ships
as an installable Progressive Web App and is used primarily on iPad, installed to the home screen
so it behaves like a standalone app rather than a browser tab.

## URLs

- Production: https://zdonhauser.github.io/prs-success-story/
- Staging: https://zdonhauser.github.io/prs-success-story/staging/

## Develop

```bash
npm install
npm run dev      # local dev server
npm test         # run the test suite once
npm run lint     # eslint over src
npm run build    # production build to dist/
```

## Deploy

Every push to `main` automatically deploys to staging only. Production is a separate branch,
`prod`, that only moves when someone explicitly promotes it, so staging can be pushed to and
verified without any risk to what coordinators are using in the field.

To promote a build to production, go to the Actions tab and run the "Promote to Production"
workflow (or `gh workflow run promote.yml`), optionally passing a `ref` input, a branch name or
commit SHA, to promote. Passing an older SHA is also how you roll production back: promote the
last SHA that worked, then re-promote main once the fix lands.

## Architecture

The codebase is organized in layers, and the layer boundaries are the main thing to respect when
adding or changing code.

- **`src/app`** is the composition root. It wires features and services together (the top-level
  `App`, header, and the hooks that connect form state to the preview) and should not contain
  business logic of its own.
- **`src/features/<name>`** holds one folder per user-facing capability: `story-form`, `photos`,
  `ai-generate`, `preview`, `export`. A feature may import from `domain`, `config`, and `services`,
  but not from another feature, with one established exception: `story-form/FormPanel` composes
  `photos` and `ai-generate` directly, since the form panel is where those pieces are surfaced to
  the user. Outside of that composition, keep features independent of each other.
- **`src/domain`** is pure functions only, no React, no DOM, no browser APIs. This is where photo
  geometry math and date formatting live, and everything here is unit-tested.
- **`src/config`** holds static template data: themes, photo layout definitions, page dimensions,
  and the AI prompt template. Data, not behavior.
- **`src/services`** is browser infrastructure: localStorage persistence and DOM text
  measurement. The messy platform-specific quirks live here, and in `features/export`, which has
  its own PDF/canvas concerns.
- **`src/styles`** is split by responsibility. `page.css` and `themes.css` define the printed
  product itself, the actual look of the one-pager, and change whenever design intent changes.
  The remaining stylesheets are app chrome (form layout, modals, responsive breakpoints) and can
  change independently of what gets printed.
- Tests are co-located next to the module they cover, as `*.test.ts` files, rather than living in
  a separate top-level test directory.

## iOS / PWA quirks worth knowing

- Installed (home-screen, standalone) PWAs open `target="_blank"` links in an embedded in-app
  browser sheet rather than full Safari. That sheet doesn't share Safari's cookies, so a user who
  is logged into ChatGPT or Claude in Safari appears logged out inside the app. This is why the AI
  links in the AI-generate flow navigate in the same window instead of opening a new tab, since
  that gives the user the best available chance of landing in a real, cookie-sharing browser
  context.
- iOS Safari, including installed PWAs, ignores the anchor `download` attribute, so a plain link
  or `<a download>` just opens the PDF in a new tab and leaves the user to manually share it to
  Files. Export instead uses the Web Share API (`navigator.share` with a `File`) so the native
  share sheet opens directly, in one tap, with a normal filename.
- html2canvas does not reliably capture `object-fit: cover` or CSS transforms (the pan/zoom used
  for cropping photos) at the scale factor needed for print-quality output. To work around this,
  each photo cell is pre-rendered to an offscreen canvas, with the crop, pan, and zoom baked into
  plain pixels, before html2canvas captures the page, so it only ever has to deal with a flat
  image rather than transformed, cover-fit DOM.
