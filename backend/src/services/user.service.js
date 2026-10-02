const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add a long random string to backend/.env')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const httpError = (status, message) => Object.assign(new Error(message), { status })

const validateCredentials = ({ email, password }) => {
    if (!email || !EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address')
    if (!password || password.length < 8) throw httpError(400, 'Password must be at least 8 characters')
    if (password.length > 128) throw httpError(400, 'Password is too long')
}

module.exports.signToken = (user) => jwt.sign(
    { sub: user._id.toString(), v: user.tokenVersion },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
)

module.exports.verifyToken = (token) => jwt.verify(token, JWT_SECRET)

module.exports.createUser = async ({ name, email, password }) => {
    email = String(email || '').trim().toLowerCase()
    validateCredentials({ email, password })

    const hash = await bcrypt.hash(password, 12)
    const existing = await userModel.findOne({ email }).select('+password')

    if (existing?.password) throw httpError(409, 'An account with this email already exists. Please log in')

    // Accounts created by the old Google sign-in have no password; let the owner claim it
    if (existing) {
        existing.password = hash
        if (name) existing.name = name
        await existing.save()
        return existing
    }

    return userModel.create({ name: name?.trim() || undefined, email, password: hash })
}

module.exports.authenticate = async ({ email, password }) => {
    email = String(email || '').trim().toLowerCase()
    const user = await userModel.findOne({ email }).select('+password')
    // Same message for unknown email and wrong password so emails can't be enumerated
    const ok = user?.password && await bcrypt.compare(String(password || ''), user.password)
    if (!ok) throw httpError(401, 'Invalid email or password')
    return user
}
