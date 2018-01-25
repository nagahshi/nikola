const Repository = require('../../config/Repository')

class Model extends Repository {
  constructor () {
    let fields = {
      id: '',
      email: {required: 1},
      password: {required: 1, min: 6}
    }
    super('users', 'Usuários', fields)
  }
}

module.exports = Model
