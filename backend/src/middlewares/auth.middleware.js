const userModel = require('../models/user.model')
const { verifyToken } = require('../services/user.service')

const getBearer = (req) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ')
    return scheme === 'Bearer' && token && token !== 'null' && token !== 'undefined' ? token : null
}

const resolveUser = async (token) => {
    const payload = verifyToken(token)
    const user = await userModel.findById(payload.sub)
    // tokenVersion changes on logout, invalidating older tokens
    if (!user || user.tokenVersion !== payload.v) throw new Error('Session expired')
    return user
}

module.exports.requireAuth = async (req, res, next) => {
    const token = getBearer(req)
    if (!token) return res.status(401).json({ message: 'Please log in to continue' })
    try {
        req.user = await resolveUser(token)
        next()
    } catch {
        res.status(401).json({ message: 'Your session has expired. Please log in again' })
    }
}

// Attaches req.user when a valid token is sent, but lets guests through
module.exports.optionalAuth = async (req, res, next) => {
    const token = getBearer(req)
    if (token) {
        try {
            req.user = await resolveUser(token)
        } catch {
            return res.status(401).json({ message: 'Your session has expired. Please log in again' })
        }
    }
    next()
}
