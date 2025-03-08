const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    fingerprint: {
        type: String,
    },
    accessToken: {
       type: String
    },
    uid: {
        type: String
    }
}, {timestamps: true})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel