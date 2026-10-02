const mongoose = require('mongoose')

// One document per quota key (e.g. "user:<id>", "guest:fp:<id>", "guest:ip:<ip>")
// counting analyses inside a rolling window that starts at windowStart.
const usageSchema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    count: { type: Number, default: 0 },
    // Stale documents are removed automatically 2 days after their window opened
    windowStart: { type: Date, default: Date.now, expires: 2 * 24 * 3600 },
})

const usageModel = mongoose.model('Usage', usageSchema)

module.exports = usageModel
