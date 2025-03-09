const admin = require('../../firebase-admin')
const userModel = require('../models/user.model')

module.exports.userAuthMiddleware = async (req, res , next)=> {
    const token = req.headers?.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'accessToken not found' })
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token)
        if (!decodedToken) throw new Error('Firebase auth token verification failed')
        const { email } = decodedToken
        const user = await userModel.findOne({email})
        if (!user) throw Error('User not exist. Please signup')
        req.user = user
    next()
    } catch (error) {
        res.status(401).json({message: error.message || 'Something went wrong. While user decoding from accessToken'})
    }
}