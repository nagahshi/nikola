// require restify to manipulate routes
const server = require('./config/server')

/**
 *  FOR REGISTER ROUTER
 *  APPLY SERVER TO REGISTER ROUTES
 */

require('./domains/user').applyRoutes(server)

//listener server at port
server.listen(process.env.API_PORT)
