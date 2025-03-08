const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
var cookieParser = require('cookie-parser')

const app = express()

dotenv.config()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', (req, res)=> {
    res.send('Hello Node')
})

// Routes
const aiRoutes = require('./routes/ai.routes')
const userRoutes = require('./routes/user.routes')

app.use('/ai/v2', aiRoutes)
app.use('/ai/v2/user', userRoutes)

module.exports = app