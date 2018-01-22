const Router     = require('restify-router').Router
const Controller = require('./controller')
const router     = new Router()
let defaultRoute = 'user'

let InstanceController = new Controller()

router.get(`/${defaultRoute}`, async (req,res,next) => {
  try {
    res.send(await InstanceController.index(req))
    next()
  } catch (error) {
    res.send(error)
    next()
  }
})

router.post(`/auth/register`, async (req,res,next) => {
  try {
    res.send(await InstanceController.store(req))
    next()
  } catch (error) {
    res.send(error)
    next()
  }
})

router.get(`/${defaultRoute}/:id`, async (req,res,next) => {
  try {
    res.send(await InstanceController.show(req))
    next()
  } catch (error) {
    res.send(error)
    next()
  }
})

router.put(`/${defaultRoute}/:id`, async(req, res, next) => {
  try {
    res.send(await InstanceController.update(req))
    next()
  } catch (error) {
    res.send(error)
    next()
  }
})

router.post(`/auth/login`, async(req, res, next) => {
  try {
    res.send(await InstanceController.authenticate(req))
    next()
  } catch (error) {
    res.send(error)
    next()
  }
});

module.exports = router;
