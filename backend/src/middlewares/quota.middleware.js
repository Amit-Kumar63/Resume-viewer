const usageModel = require('../models/usage.model')

const WINDOW_MS = 24 * 3600 * 1000
const LIMITS = {
    user: Number(process.env.USER_DAILY_LIMIT) || 10,
    guest: Number(process.env.GUEST_DAILY_LIMIT) || 2,
    // Per-IP cap for guests so clearing the browser fingerprint doesn't reset the quota.
    // Higher than the guest limit because offices/colleges share one IP.
    guestIp: Number(process.env.GUEST_IP_DAILY_LIMIT) || 6,
}

// Quota keys that apply to this request, most specific first
const quotaKeys = (req) => {
    if (req.user) return [{ key: `user:${req.user._id}`, limit: LIMITS.user }]
    const keys = [{ key: `guest:ip:${req.ip}`, limit: LIMITS.guestIp }]
    const fingerprint = String(req.headers['x-client-id'] || '').slice(0, 64)
    if (fingerprint) keys.unshift({ key: `guest:fp:${fingerprint}`, limit: LIMITS.guest })
    return keys
}

const resetIfExpired = (key, now) => usageModel.updateOne(
    { key, windowStart: { $lte: new Date(now - WINDOW_MS) } },
    { $set: { count: 0, windowStart: now } }
)

// Atomically take one unit of quota. Returns the updated doc, or null when the limit is reached.
const take = async ({ key, limit }) => {
    const now = new Date()
    await resetIfExpired(key, now)
    try {
        return await usageModel.findOneAndUpdate(
            { key, count: { $lt: limit } },
            { $inc: { count: 1 }, $setOnInsert: { windowStart: now } },
            { upsert: true, new: true }
        )
    } catch (error) {
        // Doc exists with count >= limit, so the upsert collided with the unique key
        if (error.code === 11000) return null
        throw error
    }
}

const giveBack = (key) => usageModel.updateOne({ key, count: { $gt: 0 } }, { $inc: { count: -1 } })

const summarize = (doc, limit, plan) => {
    const fresh = !doc || Date.now() - doc.windowStart.getTime() >= WINDOW_MS
    const used = fresh ? 0 : doc.count
    return {
        plan,
        limit,
        used,
        remaining: Math.max(0, limit - used),
        resetsAt: fresh ? null : new Date(doc.windowStart.getTime() + WINDOW_MS),
    }
}

module.exports.consumeQuota = async (req, res, next) => {
    try {
        const keys = quotaKeys(req)
        const taken = []
        for (const entry of keys) {
            const doc = await take(entry)
            if (!doc) {
                await Promise.all(taken.map(({ key }) => giveBack(key)))
                const current = await usageModel.findOne({ key: entry.key })
                const usage = summarize(current, entry.limit, req.user ? 'user' : 'guest')
                return res.status(429).json({
                    code: 'QUOTA_EXCEEDED',
                    message: req.user
                        ? `You've used all ${entry.limit} analyses for today. Your quota resets in 24 hours`
                        : 'Free guest analyses used up. Create a free account to get more',
                    usage,
                })
            }
            taken.push({ ...entry, doc })
        }

        let refunded = false
        req.quota = {
            usage: summarize(taken[0].doc, taken[0].limit, req.user ? 'user' : 'guest'),
            // Called when the analysis fails so the user isn't charged for it
            refund: async () => {
                if (refunded) return
                refunded = true
                await Promise.all(taken.map(({ key }) => giveBack(key)))
            },
        }
        next()
    } catch (error) {
        console.error('Quota error:', error)
        res.status(500).json({ message: 'Could not check your usage. Please try again' })
    }
}

module.exports.getUsage = async (req) => {
    const [primary] = quotaKeys(req)
    const doc = await usageModel.findOne({ key: primary.key })
    return summarize(doc, primary.limit, req.user ? 'user' : 'guest')
}
