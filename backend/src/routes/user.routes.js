const express = require('express')
const userController = require('../controllers/user.controller')
const {limitMiddleware} = require('../middlewares/limit.middleware')

const router = express.Router()

router.post('/signup', limitMiddleware, userController.userSignupController)


module.exports = router