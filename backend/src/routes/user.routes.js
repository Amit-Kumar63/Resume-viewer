const express = require('express')
const userController = require('../controllers/user.controller')
const { userAuthMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/signup', userController.userSignupController)
router.get('/login', userAuthMiddleware, userController.userLoginController)
router.get('/logout', userAuthMiddleware, userController.userLogoutController);

module.exports = router