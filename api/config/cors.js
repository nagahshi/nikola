const corsMiddleware = require('restify-cors-middleware')

module.exports = corsMiddleware({
  preflightMaxAge: 5,
  origins: ['*'],
  allowHeaders: ['*'],
  exposeHeaders: ['*']
})
