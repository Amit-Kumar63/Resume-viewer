const express = require('express')
const aiController = require('../controllers/ai.controller')
const upload = require('../middlewares/multer.middleware')
const { limitMiddleware } = require('../middlewares/limit.middleware')

const router = express.Router()

router.post('/get-response', limitMiddleware, upload.single('file'), aiController.createPromptController)

module.exports = router