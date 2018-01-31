const jwt = require('jsonwebtoken')

const jwtMiddleware = (deps) => {
  return async (req, res, next) => {
    if (!deps.exclusions.includes(req.path())) {
      let token = req.headers['x-access-token']
      if (!token) {
        res.send(403, {error: 'Token não encontrado'})
        return false
      }

      try {
        req.decoded = jwt.verify(token, process.env.JWT_SECRET)
      } catch (error) {
        res.send(403, {error: 'Falha ao autenticar o token'})
        return false
      }
    }
    next()
  }
}

const auth = (objectToAuth, expiresIn = (60 * 60 * 24)) => jwt.sign(objectToAuth, process.env.JWT_SECRET, {expiresIn: expiresIn})

module.exports = { jwtMiddleware, auth }
