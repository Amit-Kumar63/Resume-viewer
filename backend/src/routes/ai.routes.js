const express = require('express')
const aiController = require('../controllers/ai.controller')
const upload = require('../middlewares/multer.middleware')

const router = express.Router()

router.post('/get-response', upload.single('file'), aiController.createPromptController)

module.exports = router