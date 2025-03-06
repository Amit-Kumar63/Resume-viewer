const fs = require('fs')

module.exports.extractText = async ({file})=> {

  const fileBuffer = fs.readFileSync(file.path);
  const base64Image = fileBuffer.toString('base64');
  const dataUri = `data:${file.mimetype};base64,${base64Image}`;

  const params = new URLSearchParams();
    params.append('base64Image', dataUri);
  try {
    const url = `https://api.ocr.space/parse/image`
    const jsonResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': 'dde0c539e488957',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString() 
    })
    const response = await jsonResponse.json()  
    return response.ParsedResults[0].ParsedText
  } catch (error) {
    throw error
  }
}
