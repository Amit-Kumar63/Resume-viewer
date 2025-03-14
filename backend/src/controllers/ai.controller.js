const {createPrompt} = require('../services/ai.service')
const { extractText } = require('../services/ocr.service')
const fs = require('fs')
const limitModel = require('../models/limit.model')

module.exports.createPromptController = async(req, res)=> {
    const file = req.file
    try {
        const text = await extractText({file})
        if (!text) return res.status(404).json({message: 'Image to text convertion failed'})
        const completion = await createPrompt({prompt: text})
        fs.unlinkSync(file.path)
        res.status(200).json({messages: 'Resume check successfully', data: completion.choices[0].message.content})
    } catch (error) {
        res.status(401).json({message: error.message})
        fs.unlinkSync(file.path)
    }
}