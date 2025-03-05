const Tesseract = require("node-tesseract-ocr")

const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}
module.exports.extractText = async ({file})=> {
  try {
    const response = await Tesseract.recognize(file, config)
    return response
  } catch (error) {
    throw error
  }
}
