// Browsers can't decode every image format a phone or scanner might hand
// over. Chrome/Firefox can't display HEIC/HEIF at all (only Safari can, via
// the OS's system codecs — and even there, not reliably in a canvas), and
// none of the major browsers can decode TIFF. Rather than let those photos
// silently fail to load, convert them to a browser-native format up front,
// entirely client-side, before they ever reach the existing FileReader/
// <img> pipeline in PhotoSection.
//
// AVIF, WebP, JPEG, PNG, GIF, and BMP are all natively decodable in every
// browser this app targets (iOS/iPadOS Safari, desktop Chrome/Safari/
// Firefox), so they pass through untouched. RAW camera formats (.cr2,
// .nef, .arw, etc.) are intentionally out of scope — decoding them needs
// the kind of demosaicing work a dcraw port would take, which is a lot of
// bundle weight for a format nobody's actually shooting a flyer photo in.
// heic2any bundles a full HEIC decoder (libheif compiled to WASM) inline —
// over a megabyte on its own — and UTIF2 adds another chunk on top. Most
// uploads are already JPEG/PNG, so both are dynamically imported inside the
// converter functions below rather than imported at module load time. That
// keeps them out of the app's initial JS payload entirely; the browser only
// fetches (and the PWA only caches, once fetched) whichever decoder a given
// upload actually needs.
const HEIC_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'])
const HEIC_EXTENSION = /\.hei[cf]$/i
const TIFF_TYPES = new Set(['image/tiff', 'image/tif'])
const TIFF_EXTENSION = /\.tiff?$/i

function isHeic(file: File): boolean {
  return HEIC_TYPES.has(file.type.toLowerCase()) || HEIC_EXTENSION.test(file.name)
}

function isTiff(file: File): boolean {
  return TIFF_TYPES.has(file.type.toLowerCase()) || TIFF_EXTENSION.test(file.name)
}

/** Converts a HEIC/HEIF or TIFF file to JPEG/PNG client-side; passes any
    already-browser-native format through unchanged. Throws a message
    that's safe to show the user directly if conversion fails. */
export async function normalizeImageFile(file: File): Promise<File> {
  if (isHeic(file)) return convertHeicToJpeg(file)
  if (isTiff(file)) return convertTiffToPng(file)
  return file
}

async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const { default: heic2any } = await import('heic2any')
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    const blob = Array.isArray(result) ? result[0] : result
    return new File([blob], file.name.replace(HEIC_EXTENSION, '.jpg'), { type: 'image/jpeg' })
  } catch {
    throw new Error(`Couldn't convert "${file.name}" — it looks like HEIC/HEIF but didn't convert cleanly. Try exporting it as JPEG first.`)
  }
}

async function convertTiffToPng(file: File): Promise<File> {
  try {
    const UTIF = await import('utif2')
    const buffer = await file.arrayBuffer()
    const ifds = UTIF.decode(buffer)
    UTIF.decodeImage(buffer, ifds[0])
    const rgba = UTIF.toRGBA8(ifds[0])

    const canvas = document.createElement('canvas')
    canvas.width = ifds[0].width
    canvas.height = ifds[0].height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no 2D context')
    const imageData = ctx.createImageData(canvas.width, canvas.height)
    imageData.data.set(rgba)
    ctx.putImageData(imageData, 0, 0)

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('canvas.toBlob returned null'))), 'image/png')
    )
    return new File([blob], file.name.replace(TIFF_EXTENSION, '.png'), { type: 'image/png' })
  } catch {
    throw new Error(`Couldn't convert "${file.name}" — it looks like a TIFF that didn't decode cleanly. Try exporting it as JPEG first.`)
  }
}
