const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
var cookieParser = require('cookie-parser')
const cron = require('node-cron');
const limitModel = require('./models/limit.model'); 

const app = express()

dotenv.config()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// Reset Count after 1 week from limite model
cron.schedule('0 0 * * 0', async () => {
    try {
        await limitModel.updateMany({}, { count: 0 });
        console.log('Count reset to 0 for all users');
    } catch (error) {
        console.error('Error resetting count:', error);
    }
});

// Routes
const aiRoutes = require('./routes/ai.routes')
const userRoutes = require('./routes/user.routes')

app.use('/ai/v2', aiRoutes)
app.use('/ai/v2/user', userRoutes)

module.exports = app
