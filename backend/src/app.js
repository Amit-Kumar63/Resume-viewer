const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')

const app = express()

dotenv.config()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res)=> {
    res.send('Hello Node')
})

// Routes
const aiRoutes = require('./routes/ai.routes')

app.use('/ai/v2', aiRoutes)

module.exports = app