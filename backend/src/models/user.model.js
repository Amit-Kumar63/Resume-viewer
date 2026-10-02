const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 60,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
    },
    // bcrypt hash; excluded from queries unless explicitly selected
    password: {
        type: String,
        select: false,
    },
    // Bumped on logout so every previously issued JWT stops working
    tokenVersion: {
        type: Number,
        default: 0,
    },
}, {timestamps: true})

userSchema.methods.toPublic = function () {
    return { id: this._id, name: this.name, email: this.email, createdAt: this.createdAt }
}

const userModel = mongoose.model('User', userSchema)

module.exports = userModel
