const { auth } = require('../../config/MiddlewareJWT')
const sha1 = require('sha1')
const Model = require('./model')
const skelController = require('../../config/Controller')
const Mailer = require('../../config/Mailler')
const fs = require('fs')
const hb = require('handlebars')

class Controller extends skelController {
  constructor () {
    super(Model)
    this.localModel = ''
  }

  store (req) {
    this.localModel = new Model()
    return new Promise((resolve, reject) => {
      this.localModel.store(req.params)
        .then(id => {
          let { email } = req.params
          let template = hb.compile(fs.readFileSync(`${__dirname}/templates/register.tpl`, 'utf8'))
          let data = {email: email}
          let mailer = new Mailer()
          mailer.send('<will> teste@teste', 'willian.empari@gmail.com', 'Bem vindo', template(data), '')

          resolve({token: auth({email, id})})
        })
        .catch((err) => {
          console.log(err)
          if (err) reject(new Error(`Falha ao logar usuario:${req.params.email}`))
        })
    })
  }

  authenticate (req) {
    this.localModel = new Model()
    return new Promise((resolve, reject) => {
      let { email, password } = req.params

      if (!password) reject(new Error({ error: `Campo senha não encontrado` }))

      this.localModel.where('email', '=', email).where('password', '=', sha1(password)).first()
        .then(user => {
          try {
            let { email, id } = user
            resolve({token: auth({email, id})})
          } catch (e) {
            console.log(e)
            reject(new Error({ error: `Falha ao logar usuario:${email}` }))
          }
        })
    })
  }
}

module.exports = Controller
