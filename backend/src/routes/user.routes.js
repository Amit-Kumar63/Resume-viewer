const express = require('express')
const userController = require('../controllers/user.controller')
const { requireAuth } = require('../middlewares/auth.middleware')
const { authLimiter } = require('../middlewares/rateLimit.middleware')

const router = express.Router()

router.post('/signup', authLimiter, userController.userSignupController)
router.post('/login', authLimiter, userController.userLoginController)
router.get('/me', requireAuth, userController.userMeController)
router.post('/logout', requireAuth, userController.userLogoutController)

module.exports = router
