const { analyzeResume } = require('../services/ai.service')
const { extractText } = require('../services/ocr.service')
const { getUsage } = require('../middlewares/quota.middleware')

const clean = (value, max) => String(value || '').trim().slice(0, max)

module.exports.createPromptController = async(req, res)=> {
    const { usage } = req.quota
    try {
        if (!req.file) {
            await req.quota.refund()
            return res.status(400).json({ message: 'Please choose a resume file to upload' })
        }

        const resumeText = await extractText({file: req.file})
        const result = await analyzeResume({
            resumeText,
            targetRole: clean(req.body.targetRole, 120),
            jobDescription: clean(req.body.jobDescription, 8000),
        })

        if (result.format === 'structured' && result.content.is_resume === false) {
            await req.quota.refund()
            return res.status(422).json({ message: "This file doesn't look like a resume. Please upload your CV" })
        }

        res.status(200).json({ message: 'Resume analyzed successfully', data: result, usage })
    } catch (error) {
        await req.quota.refund()
        console.error('Analyze error:', error.message)

        if (error.status) {
            return res.status(error.status).json({ message: error.message })
        }
        if (error.statusCode === 429) {
            return res.status(503).json({ message: 'AI service is busy. Please try again in a minute.' })
        }
        if (error.name === 'TimeoutError') {
            return res.status(504).json({ message: 'The analysis took too long. Please try again' })
        }
        res.status(502).json({ message: 'The AI service failed to respond. Please try again' })
    }
}

module.exports.usageController = async (req, res) => {
    try {
        res.status(200).json({ usage: await getUsage(req) })
    } catch (error) {
        res.status(500).json({ message: 'Could not load usage' })
    }
}
