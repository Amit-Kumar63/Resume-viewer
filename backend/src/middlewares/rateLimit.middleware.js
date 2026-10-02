const { rateLimit } = require('express-rate-limit')

const tooMany = (message) => (req, res, next, options) =>
    res.status(options.statusCode).json({ message })

const base = { standardHeaders: 'draft-7', legacyHeaders: false }

// General ceiling for every API request from one IP
module.exports.apiLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 120,
    handler: tooMany('Too many requests. Please slow down'),
})

// Login/signup brute-force protection; successful logins don't count
module.exports.authLimiter = rateLimit({
    ...base,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    handler: tooMany('Too many attempts. Please try again in 15 minutes'),
})

// Short burst guard on the expensive analyze endpoint (daily quota is separate)
module.exports.analyzeBurstLimiter = rateLimit({
    ...base,
    windowMs: 60 * 1000,
    limit: 3,
    handler: tooMany('You are going too fast. Please wait a minute before analyzing again'),
})
