const userServices = require('../services/user.service')
const admin = require('../../firebase-admin')
const userModel = require('../models/user.model')

module.exports.userSignupController = async (req, res)=> {
    const token = req.headers?.authorization?.split(' ')[1]

    if (!token) res.status(401).json({message: 'Token is required'})
        try {
            const decodedToken = await admin.auth().verifyIdToken(token)
            if (!decodedToken) {
                throw new error('Firebase auth token verification failed')
            }
            const { email, uid } = decodedToken

            const existingUser = await userModel.findOne({email})
            if (existingUser) res.status(400).json({message: 'User already exist. Please try to login'})

            const user = await userServices.createUser({
                uid,
                email,
                accessToken: token,
            })
            const cookieOptions = {
                expires: new Date(Date.now() + 24 * 3600000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            }
            res.cookie('ai-hr', token, cookieOptions)
            res.status(200).json({message: 'User signup successfully', user, token})
        } catch (error) {
            res.status(404).json({messages: error.message || 'Something went wrong'})
        }
}
module.exports.userLoginController = async (req, res) => {
    const user = req.user;

    try {
        if (!user) return res.status(401).json({ message: 'User not found' })
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 3600000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
        res.cookie('token', user.accessToken, cookieOptions);
        res.status(200).json({ user, token: user.accessToken });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports.userLogoutController = async (req, res) => {
    const user = req.user;
    res.clearCookie('token');
    res.status(200).json({ message: 'User logged out successfully' });
}