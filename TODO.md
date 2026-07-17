# TODO / backlog

## Portrait-mode HEIC fails to convert in Chrome (works in Safari)

A real-world sample (`IMG_8548.heic`, iPhone Portrait-mode shot) fails heic2any conversion in
Chrome with `ERR_LIBHEIF format not supported` (libheif error code 2). Its container carries the
`MiPr`/`tmap` compatible brands — Apple's Portrait/depth-map + tone-mapped (gain map) HEIC
variant — which the old libheif build bundled inside `heic2any` (v0.0.4, effectively frozen since
2021) can't parse.

Why Safari appears fine: Safari (macOS and iOS) transcodes HEIC to JPEG at the file-input
boundary before the page ever sees the file, so our conversion path never runs there. Chrome
hands over the raw HEIC, hits heic2any, and fails.

No quick fix exists — Chrome has no native HEIC decode to fall back on. The real fix is swapping
`heic2any` for a maintained decoder with a current libheif WASM build (e.g. `libheif-js` latest,
libheif ≥1.17 handles gain-map/auxiliary-image HEICs much better), keeping the same
`normalizeImageFile` interface in `src/services/imageConversion.ts` so nothing else changes.
Medium effort: new WASM asset (~1MB, already dynamically imported so no initial-bundle cost),
plus re-testing both the plain HEIC and the Portrait-mode sample in Chrome.
