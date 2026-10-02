const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { apiLimiter } = require('./middlewares/rateLimit.middleware')
const { MAX_MB } = require('./middlewares/multer.middleware')

const app = express()

// Behind a reverse proxy (Render, Nginx, Docker ingress...) set TRUST_PROXY=1 so
// rate limits see the real client IP instead of the proxy's
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY)
}

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({extended: true, limit: '100kb'}))

// Routes
const aiRoutes = require('./routes/ai.routes')
const userRoutes = require('./routes/user.routes')

app.use('/ai/v2', apiLimiter)
app.use('/ai/v2', aiRoutes)
app.use('/ai/v2/user', userRoutes)

// Upload errors (too large, wrong type) arrive here after quota was reserved, so refund it
app.use(async (err, req, res, next) => {
    await req.quota?.refund().catch(() => {})
    if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? `File is too large. Maximum size is ${MAX_MB} MB` : err.message
        return res.status(400).json({ message })
    }
    if (err.status) return res.status(err.status).json({ message: err.message })
    console.error(err)
    res.status(500).json({ message: 'Something went wrong. Please try again' })
})

module.exports = app
