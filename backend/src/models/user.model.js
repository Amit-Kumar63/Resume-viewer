const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    count: { 
        type: Number, 
        default: 0,
    },
    lastUsed: { 
        type: Date, 
        default: Date.now, 
    },
    accessToken: {
       type: String
    },
    uid: {
        type: String
    },
}, {timestamps: true})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel