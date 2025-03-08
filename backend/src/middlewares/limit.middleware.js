const limitModel = require("../models/limit.model");

module.exports.limitMiddleware = async (req, res, next) => {
    const fingerprint = req.headers?.authorization?.split(' ')[1]
    if (!fingerprint)
        res.status(404).json({
            message: "Something went wrong or fingerprint not found",
        });
    try {
        console.log(fingerprint)
        let user = await limitModel.findOne({fingerprint: fp})
        if (!user) {
            user = new limitModel({fingerprint, count: 1})
            await user.save()
            return next()
        }
        if (user.count >= 4) {
            return res.status(403).json({ message: "Limit reached, please login" });
        }
        user.count += 1;
        user.lastUsed = Date.now();
        await user.save();
    
        next();
    } catch (error) {
        console.error("Usage tracking error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
