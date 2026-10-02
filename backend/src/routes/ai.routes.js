const express = require('express')
const aiController = require('../controllers/ai.controller')
const upload = require('../middlewares/multer.middleware')
const { optionalAuth } = require('../middlewares/auth.middleware')
const { consumeQuota } = require('../middlewares/quota.middleware')
const { analyzeBurstLimiter } = require('../middlewares/rateLimit.middleware')

const router = express.Router()

router.get('/usage', optionalAuth, aiController.usageController)
router.post('/get-response', analyzeBurstLimiter, optionalAuth, consumeQuota, upload.single('file'), aiController.createPromptController)

module.exports = router
