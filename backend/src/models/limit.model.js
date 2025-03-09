const mongoose = require('mongoose')

const limitSchema = new mongoose.Schema({
    fingerprint:  { type: String, unique: true },
    count: { type: Number, default: 0},
    lastUsed: { type: Date, default: Date.now, expires: 604800 }
}, {timestamps: true})

const limitModel = mongoose.model('Limit', limitSchema)

module.exports = limitModel