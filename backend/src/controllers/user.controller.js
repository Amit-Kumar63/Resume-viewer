const userServices = require('../services/user.service')

const sendError = (res, error) => {
    if (!error.status) console.error(error)
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Something went wrong. Please try again' })
}

module.exports.userSignupController = async (req, res)=> {
    try {
        const { name, email, password } = req.body
        const user = await userServices.createUser({ name: String(name || '').slice(0, 60), email, password })
        res.status(201).json({ message: 'Account created', user: user.toPublic(), token: userServices.signToken(user) })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports.userLoginController = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userServices.authenticate({ email, password })
        res.status(200).json({ message: 'Welcome back', user: user.toPublic(), token: userServices.signToken(user) })
    } catch (error) {
        sendError(res, error)
    }
}

module.exports.userMeController = (req, res) => {
    res.status(200).json({ user: req.user.toPublic() })
}

module.exports.userLogoutController = async (req, res) => {
    try {
        // Invalidate every token issued so far for this user
        req.user.tokenVersion += 1
        await req.user.save()
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        sendError(res, error)
    }
}
