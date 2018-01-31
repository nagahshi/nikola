const { connection, errorHandler } = require('./Mysql')

/**
 * @description {PRIVATE} prepare where statement
 * @param iC
 * @returns {string}
 */
let prepareWhere = (iC) => {
  let where = ``
  if (iC.arrWhere.length || iC.arrWhereOr.length) {
    if (iC.arrWhere.length && iC.arrWhereOr.length) {
      where = ` WHERE (${iC.arrWhere.join(' AND ')}) AND (${iC.arrWhereOr.join(' OR ')})`
    } else {
      if (iC.arrWhere.length) {
        where = ` WHERE ${iC.arrWhere.join(' AND ')}`
      } else {
        where = ` WHERE ${iC.arrWhereOr.join(' OR ')}`
      }
    }
  }
  return where
}

/**
 * @description {PRIVATE} prepare fields for SET in update
 * @param mappedFields - fields mapped in model
 * @param fieldsToUpdate - fields to update
 * @returns {string[]} - array with query
 */
let prepareFieldsToUpdate = (mappedFields, fieldsToUpdate) => Object.keys(fieldsToUpdate)
  .filter(key => mappedFields.includes(key))
  .map(key => `${key} = ${connection.escape(fieldsToUpdate[key])}`)

/**
 * @description {PRIVATE} prepare fields for INSERT INTO
 * @param mappedFields - fields mapped in model
 * @param fieldsToSave - fields to insert
 * @returns {string[]} -
 */
let prepareFieldsToSave = (mappedFields, fieldsToSave) => Object.keys(fieldsToSave)
  .filter(key => mappedFields.includes(key))
  .map(key => key)

/**
 * @description {PRIVATE} prepare values for VALUES on insert into
 * @param mappedFields fields mapped in model
 * @param fieldsToSave values to insert
 * @returns {any[]}
 */
let prepareValuesToSave = (mappedFields, fieldsToSave) => Object.keys(fieldsToSave)
  .filter(key => mappedFields.includes(key))
  .map(key => connection.escape(fieldsToSave[key]))

/**
 * @description {PRIVATE} prepare query to insert with fields and values
 * @param mappedFields fields mapped in model
 * @param fieldsToSave values to insert
 * @returns {string}
 */
let makeQueryToSave = (mappedFields, fieldsToSave) => {
  let fields = prepareFieldsToSave(mappedFields, fieldsToSave)
  let values = prepareValuesToSave(mappedFields, fieldsToSave)
  return `(${fields.join(',')}) VALUES(${values.join(',')})`
}

/**
 * @description prepare msg to return at save or update register
 * @param {object} err - error object created by connection mysql
 * @param {string} defaultMsg - message default
 * @returns {string}
 */
let handlerMsg = (err, defaultMsg) => {
  if (err.hasOwnProperty('errno')) {
    switch (err.errno) {
      case 1062:
        return `Registro não pode entrar duplicado no banco de dados`
      case 1054:
        return `Coluna não existe`
      default:
        return defaultMsg
    }
  } else {
    return defaultMsg
  }
}

/**
 * @description {PRIVATE} validate request values
 * @param {object} validates - object with validations in fields
 * @param {string[]} data - request values to be validate
 * @returns {any[]} - error array
 */
let isValid = (table, validates, data) => Object.keys(validates)
  .map((key) => {
    let keyErr = {}
    keyErr[key] = {}

    if (validates[key].hasOwnProperty('required') && !data.hasOwnProperty(key)) {
      keyErr[key]['required'] = `Error ${key} is required`
    } else {
      if (validates[key].hasOwnProperty('min') && data[key].length <= validates[key].min) {
        keyErr[key]['min'] = `Error ${key} min length is ${validates[key].min}`
      }
      if (validates[key].hasOwnProperty('max') && data[key].length >= validates[key].max) {
        keyErr[key]['max'] = `Error ${key} max length is ${validates[key].max}`
      }
    }
    return keyErr
  })
  .filter(ob => {
    let v = typeof Object.values(ob)[0] !== 'undefined' ? Object.values(ob)[0] : {}
    return v.hasOwnProperty('max') || v.hasOwnProperty('min') || v.hasOwnProperty('required')
  })

/**
 * @description class repository
 */
class Repository {
  /**
   * @description Building class
   * @param {string} table - name of table in mysql
   * @param {string} name - name presententation for errors treatment
   * @param {object} validates - validates to be evaluates
   * @property {string[]} fields - mapped fields on model
   * @property {string} qSelect - query select
   * @property {string[]} arrWhere - query array's instanced in object
   * @property {string[]} arrWhereOr - query array's instanced in object using OR
   * @property {string[]} arrJoin - join's array
   */
  constructor (table = '', name = '', validates = {}) {
    this.table = table
    this.name = name || table
    this.fields = Object.keys(validates)
    this.qSelect = `SELECT ${this.fields.map((f) => `${table}.${f}`).join(',')} FROM ${table} as ${table}`
    this.arrWhere = []
    this.arrWhereOr = []
    this.arrJoin = []
    this.validates = validates
  }

  /**
   * @description return Promise with query to select all registers
   * @returns {Promise<any>}
   */
  all () {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM ${this.table}`, (error, results) => {
        if (error) {
          errorHandler(error, 'Falha ao listar categorias', reject)
          return false
        } else {
          resolve({categories: results})
        }
      })
    })
  }

  /**
   * @description prepare where with AND statement
   * @param {string} field - field in where statement
   * @param {string} operator - operator to filter in where
   * @param {string|number} value - value to search in where
   * @returns {Repository} - return self
   */
  where (field, operator, value) {
    if (typeof value === 'number' || typeof value === 'string') {
      this.arrWhere.push(`${this.table}.${field} ${operator} ${connection.escape(value)}`)
    }
    return this
  }

  /**
   * @description prepare where with OR statement
   * @param {string} field - field in where statement
   * @param {string} operator - operator to filter in where
   * @param {string|number} value - value to search in where
   * @returns {Repository} - return self
   */
  whereOr (field, operator, value) {
    if (typeof value === 'number' || typeof value === 'string' || (typeof value === 'object' && value === null)) {
      this.arrWhereOr.push(`${field} ${operator} ${connection.escape(value)}`)
    }
    return this
  }

  /**
   * @description where in raw mode, be careful
   * @param {string} string - query where
   * @returns {Repository} - return self
   */
  whereRaw (string) {
    this.arrWhere.push(` ${string} `)
    return this
  }

  /**
   * @description endpoint to fetch data paginated
   * @param {number} page - pagination
   * @returns {Promise<any>}
   */
  get (page) {
    page = parseInt(page)
    return new Promise((resolve, reject) => {
      connection.query(`SELECT COUNT(*) as count FROM ${this.table} ${prepareWhere(this)}`, (error, results) => {
        if (error) {
          errorHandler(error, `Falha ao buscar a ${this.name}`, reject)
          return false
        }

        let count = results[0].count
        let lastLimit = (page * 10)
        let firstLimit = (lastLimit - 10)
        let lastPage = (count <= 10) ? 1 : (Math.ceil(count / 10))

        let queryString = `${this.qSelect} ${this.arrJoin.join('')} ${prepareWhere(this)} LIMIT ${firstLimit},${lastLimit}`

        if (page <= lastPage) {
          connection.query(queryString, (error, results) => {
            if (error) {
              errorHandler(error, `Falha ao buscar a ${this.name}`, reject)
              return false
            } else {
              let data = [...results]
              resolve({count, current: page, next: (page += 1), lastPage, data})
            }
          })
        } else {
          resolve({count, current: page, lastPage, data: []})
        }
      })
    })
  }

  /**
   * @description define fields to select can be conbinate with join and query where
   * @param {string[]} fields - fields to select
   * @returns {Repository} - return self
   */
  select (fields = ['*']) {
    this.qSelect = `SELECT ${fields.map((f) => `${f}`).join(',')} FROM ${this.table} as ${this.table}`
    return this
  }

  /**
   * @description join QUERY model
   * @param {string} table - name of table to join
   * @param {string} foreing - name field foreing in table ex. table.table_join_id
   * @param {string} local - name field local ex. table_join.id
   * @returns {Repository} - return self
   */
  join (table, foreing, local) {
    this.arrJoin.push((table && foreing && local) ? `join ${table} ${table} on ${this.table}.${foreing} = ${table}.${local}` : '')
    return this
  }

  /**
   * @description endpoint to get a first result
   * @returns {Promise<any>}
   */
  first () {
    return new Promise((resolve, reject) => {
      let queryString = `${this.qSelect} ${this.arrJoin.join('')} ${prepareWhere(this)} LIMIT 0,1`
      connection.query(queryString, (error, results) => {
        if (error) {
          errorHandler(error, `Falha ao buscar a ${this.name}`, reject)
          return false
        } else {
          resolve(...results)
        }
      })
    })
  }

  /**
   * @description endpoint to get query
   * @returns {Promise<any>}
   */
  toSql () {
    return new Promise((resolve) => {
      resolve(`${this.qSelect} ${this.arrJoin.join('')} ${prepareWhere(this)}`)
    })
  }

  /**
   * @description endpoint to query UPDATE
   * @param {string[]} fieldsToUpdate - array with fields and values to be updated
   * @returns {Promise<any>}
   */
  update (fieldsToUpdate = {}) {
    return new Promise((resolve, reject) => {
      let queryString = `UPDATE ${this.table} SET ${prepareFieldsToUpdate(this.fields, fieldsToUpdate).join(', ')} ${prepareWhere(this)}`
      connection.query(queryString, (error, results) => {
        if (error) {
          errorHandler(error, handlerMsg(error, `Falha ao alterear ${this.name}`), reject)
          return false
        } else {
          resolve({affectedRows: results.affectedRows})
        }
      })
    })
  }

  /**
   * @description endpoint to delete query
   * @returns {Promise<any>}
   */
  delete () {
    return new Promise((resolve, reject) => {
      let queryString = `DELETE FROM ${this.table} ${prepareWhere(this)}`
      connection.query(queryString, (error, results) => {
        if (error) {
          errorHandler(error, `Falha ao remover ${this.name}`, reject)
          return false
        } else {
          resolve({affectedRows: results.affectedRows})
        }
      })
    })
  }

  /**
   * @description endpoint to query INSERT
   * @param {string[]} fieldsToSave - array with fields and values to be INSERTED
   * @returns {Promise<any>}
   */
  store (fieldsToSave = {}) {
    return new Promise((resolve, reject) => {
      try {
        let err = isValid(this.table, this.validates, fieldsToSave)
        if (!err.length) {
          let queryString = `INSERT INTO ${this.table} ${makeQueryToSave(this.fields, fieldsToSave)}`
          connection.query(queryString, (error, results) => {
            if (error) {
              errorHandler(error, handlerMsg(error, `Falha ao salvar ${this.name}`), reject)
              return false
            } else {
              resolve({insertId: results.insertId})
            }
          })
        } else {
          errorHandler({}, err, reject)
          return false
        }
      } catch (err) {
        errorHandler({}, err, reject)
        return false
      }
    })
  }

  /**
   * @description run a raw query. take be careful!
   * @param {string} query
   * @returns {Promise<any>}
   */
  query (query) {
    return new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          errorHandler(error, `Falha ao executar query em ${this.name}`, reject)
          return false
        } else {
          resolve({results})
        }
      })
    })
  }
}

module.exports = Repository
