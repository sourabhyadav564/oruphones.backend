const redisClient = require('../../config/redis')

// Middleware function to retrieve session data from Redis
const getSessionData = async (req, res, next) => {
  try {
    // Get the session ID from the request
    const sessionId = req.header('sessionID')
    console.log(sessionId)
    const sessionData = await redisClient.get(sessionId)
    console.log(sessionData)
    req.session.user = JSON.parse(sessionData)
    console.log(req.session.user)
    next()
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to retrieve session data' })
  }
}

module.exports = getSessionData
