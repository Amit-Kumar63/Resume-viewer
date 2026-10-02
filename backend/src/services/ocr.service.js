const OCR_URL = 'https://api.ocr.space/parse/image'
const OCR_API_KEY = process.env.OCR_API_KEY || 'dde0c539e488957'

const ocrError = (message) => Object.assign(new Error(message), { status: 422 })

module.exports.extractText = async ({file})=> {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

  const params = new URLSearchParams({
    base64Image: dataUri,
    OCREngine: '2',          // engine 2 is better with mixed fonts, columns and small text
    scale: 'true',
    detectOrientation: 'true',
    isOverlayRequired: 'false',
  })

  const jsonResponse = await fetch(OCR_URL, {
    method: 'POST',
    headers: {
      'apikey': OCR_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString(),
    signal: AbortSignal.timeout(60000),
  })
  const response = await jsonResponse.json().catch(() => null)

  if (!response) throw ocrError('Could not read the file. Please try again')
  if (response.IsErroredOnProcessing) {
    const reason = [].concat(response.ErrorMessage || []).join(' ')
    throw ocrError(reason || 'Could not read text from this file')
  }

  // Multi-page PDFs come back as one result per page
  const text = (response.ParsedResults || [])
    .map((page, i) => `--- Page ${i + 1} ---\n${page.ParsedText || ''}`)
    .join('\n')
    .trim()

  if (text.replace(/--- Page \d+ ---/g, '').trim().length < 50) {
    throw ocrError('We could not find readable text in this file. Try a clearer scan or a text-based PDF')
  }
  return text
}
