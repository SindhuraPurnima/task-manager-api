const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' })
    }

    // Attach the user payload to the request object
    req.user = user
    next() // Proceed to the next middleware or route handler
  })
}

module.exports = authenticateToken