const app = require('./app')
const http = require('http')
const connectDB = require('./db/db')

const PORT = process.env.PORT || 8100
connectDB()

const server = http.createServer(app)

server.listen(PORT, ()=> {
    console.log(`Server is running on Port: ${PORT}`)
})

