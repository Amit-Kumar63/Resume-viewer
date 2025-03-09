const limitModel = require("../models/limit.model");
const userModel = require('../models/user.model')
const admin = require('../../firebase-admin')

module.exports.limitMiddleware = async (req, res, next) => {
    const fingerprint = req.headers?.authorization?.split(' ')[1]
    const token = req.headers?.authorization?.split(' ')[1]

    if (!fingerprint || !token)
        res.status(404).json({
            message: "Something went wrong!. fingerprint trace failed",
        });
    try {
        // Check limit count if user login 
        if (token) {
            const decodedToken = await admin.auth().verifyIdToken(token)
            if (!decodedToken) throw new error('Invailid token')
            const { email } = decodedToken
            const LoggedInUser = await userModel.findOne({email})
            if (LoggedInUser.count >= 4) {
                return res.status(403).json({ message: "Limit reached, please login" });
            }
            LoggedInUser.count += 1;
            LoggedInUser.lastUsed = Date.now();
            await LoggedInUser.save();
        }

        // check limit count if user not loggedIn
        if (fingerprint) {
            let user = await limitModel.findOne({fingerprint})
        if (!user) {
            user = await limitModel.create({fingerprint, count: 1})
            await user.save()
            return next()
        }
        if (user.count >= 4) {
            return res.status(403).json({ message: "Limit reached, please login" });
        }
        user.count += 1;
        user.lastUsed = Date.now();
        await user.save();
        }
    
        next();
    } catch (error) {
        console.log(error)
        console.error("Usage tracking error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
