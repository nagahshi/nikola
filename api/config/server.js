/* REGISTER DATA INTO .ENV */
require('dotenv').config()
const restify = require('restify')
const server = restify.createServer()
const cors = require('./cors')
const { jwtMiddleware } = require('./jwt')

server.pre(cors.preflight)
server.use(cors.actual)
server.use(restify.plugins.bodyParser())
server.use(restify.plugins.queryParser({ mapParams: false }));

const exclusions = process.env.RESTIFY_NON_BLOCK

server.use(jwtMiddleware({ exclusions }))

module.exports = server
