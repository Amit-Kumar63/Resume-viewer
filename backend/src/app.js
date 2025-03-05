const express = require('express')
const dotenv = require('dotenv')

const app = express()

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res)=> {
    res.send('Hello Node')
})

// Routes
const aiRoutes = require('./routes/ai.routes')

app.use('/ai/v2', aiRoutes)

module.exports = app