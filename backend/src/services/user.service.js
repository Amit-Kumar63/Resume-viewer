const userModel = require('../models/user.model')

module.exports.createUser = async (
    {
        email,
        fingerprint,
        accessToken,
        uid
    }
)=> {
    if (!email) {
        throw new Error("email is required");
    }
    try {
        const user = await userModel.create({
            email,
            fingerprint,
            accessToken,
            uid
        })
        return user
    } catch (error) {
        throw new Error(error.message || 'Something went wrong. While creating user in database');
        
    }
}