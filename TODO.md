# TODO / backlog

## HEIC photo upload support

Currently `PhotoSection.tsx` hands whatever `File` the `<input type="file">` returns straight to
`FileReader.readAsDataURL`, then loads it into an `<img>`. If that file is raw HEIC/HEIF, only
Safari (via the OS's system codecs) can decode it — Chrome and Firefox can't display or
canvas-draw a HEIC `<img>` at all, so the photo slot would silently fail.

In practice this mostly doesn't bite today because iOS Safari auto-transcodes HEIC to JPEG when a
photo is handed to a web file input from the Photos library. But it's not guaranteed: files picked
via the Files app, AirDropped/"Send Original" photos, or iCloud Drive can arrive as raw HEIC, and
any non-Safari desktop browser has no fallback at all.

**Is it easy client-side?** Yes, moderately — `heic2any` (wraps `libheif` compiled to WASM) can
transcode a HEIC `File`/`Blob` to JPEG entirely in-browser, no server round trip. Rough plan:
- In the file-select handler, check `file.type === 'image/heic' || file.type === 'image/heif'`
  (and as a fallback, filename ending in `.heic`/`.heif`, since browsers often report an empty
  `type` for these), and if so, run it through `heic2any` before the existing
  `FileReader.readAsDataURL` path.
- Adds a WASM decoder to the bundle (a few hundred KB) and the conversion itself takes roughly a
  second per photo — acceptable for this app's one-photo-at-a-time manual upload flow.
- Worth wrapping in a try/catch with a clear error message on failure, since WASM HEIC decoders
  occasionally choke on unusual HEIC variants (burst photos, some Live Photo still frames).

Loosely related: a raw HEIC file that fails to decode is a second possible cause of a photo
appearing broken/blank in the exported PDF, distinct from the decode-race black-box bug fixed in
`exportPdf.ts` (see git log). Worth keeping in mind if black-box reports continue after that fix —
check whether the affected photo was HEIC-sourced.
