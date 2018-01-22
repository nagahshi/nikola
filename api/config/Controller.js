class skelController {

  constructor (model){
    this.model = model
    this.instance = ''
  }


  index(req){
    this.instance = new this.model()

    let { page } = req.query
    page = (page)?page:1

    return this.instance.get(page)
  }

  store(req){
    this.instance = new this.model()

    let data = req.params
    return this.instance.store(data)
  }

  show(req){
    this.instance = new this.model()

    let id = parseInt(req.params.id)
    return this.instance.where('id','=',id).first()
  }

  update(req){
    this.instance = new this.model()

    let id = parseInt(req.params.id)
    delete req.params.id
    let data = req.params
    return this.instance.where('id','=',id).update(data)
  }

  destroy(req){
    this.instance = new this.model()

    let id = parseInt(req.params.id)
    return this.instance.where('id','=',id).delete()
  }

}

module.exports = skelController
