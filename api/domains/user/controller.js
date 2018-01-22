const { auth } = require('../../config/jwt')
const sha1     = require('sha1')
const Model    = require('./model')
const skelController = require('../../config/Controller')
class Controller extends skelController {

  constructor () {
    super(Model)
    this.localModel
  }

  store(req){
    this.localModel = new Model()
    return new Promise((resolve, reject) => {
      this.localModel.store(req.params)
        .then(id => {
          let { email } = req.params
          resolve({token : auth({email,id})})
        })
        .catch(err => reject({ error: `Falha ao logar usuario:${req.params.email}` }))
    })
  }

  authenticate (req){
    this.localModel = new Model()
    return new Promise((resolve, reject) => {
      let { email, password } = req.params

      if(!password) reject({ error: `Campo senha não encontrado` })

      this.localModel.where('email','=',email).where('password','=',sha1(password)).first()
        .then(user => {
          try {
            let { email, id} = user
            resolve({token : auth({email,id})})
          } catch (e) {
            console.log(e)
            reject({ error: `Falha ao logar usuario:${email}` })
          }
        })
    })
  }

}

module.exports = Controller
