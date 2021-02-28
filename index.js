const fs = require('fs')
const path = require('path')
const Store = require('nedb')

const cuid = require('cuid')
const _ = require('lodash')

const DEFAULT_CONFIG = {
  dir: 'tmp/db'
}

const DB_FIELD_UPDATE_OPERATORS = ['$inc', '$min', '$max', '$mul']
const DBOPTIONS = ['fields', 'limit', 'skip', 'sort']

function denullify(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === 'object') {
      denullify(obj[key])
    } else if (obj[key] == null) {
      delete obj[key]
    }
  })
}

function flipid(obj, out = false) {
  Object.keys(obj).forEach(key => {
    if (key === '_id' && out) {
      obj.id = obj._id
      delete obj._id
    } else if (key === 'id' && !out) {
      obj._id = obj.id
      delete obj.id
    }
    if (obj[key] && typeof obj[key] === 'object') {
      flipid(obj[key], out)
    }
  })
}

module.exports = function(config = {}) {
  config = _.merge({}, DEFAULT_CONFIG, config)
  const stores = {}

  // Load stores
  if (fs.existsSync(config.dir)) {
    fs.readdirSync(config.dir).forEach(file => {
      const filename = path.join(config.dir, file)
      const model = file.split('.')[0]
      stores[model] = new Store({ filename, autoload: true })
    })
  }

  function db(model, modifiers = {}) {
    const { fakeid } = { ...config, ...modifiers }
    if (!stores[model]) {
      const filename = path.join(config.dir, `${model}.db`)
      stores[model] = new Store({ filename })
    }
    const store = stores[model]

    function getCursor(query, options) {
      let cursor = store.find(query)
      cursor.fields = cursor.projection
      for (const opt in options) {
        if (DBOPTIONS.includes(opt)) {
          cursor = cursor[opt](options[opt])
        }
      }
      return cursor
    }

    return {
      find: async function(query = {}, options = {}) {
        if (fakeid) flipid(query)
        const result = await new Promise((resolve, reject) => {
          getCursor(query, options).exec(function (err, result) {
            if (err) reject(err)
            resolve(result)
          })
        })
        denullify(result)
        if (fakeid) flipid(result, true)
        return result
      },

      get: async function(query = {}, options = {}) {
        if (fakeid) flipid(query)
        options.limit = 1
        const result = await new Promise((resolve, reject) => {
          getCursor(query, options).exec(function (err, result) {
            if (err) reject(err)
            resolve(result)
          })
        })
        denullify(result)
        if (fakeid) flipid(result, true)
        return result[0] || null
      },

      count: async function(query = {}, options = {}) {
        if (fakeid) flipid(query)
        const count = await new Promise((resolve, reject) => {
          getCursor(query, options).exec(function (err, docs) {
            if (err) reject(err)
            resolve(docs.length)
          })
        })
        return count
      },

      create: async function(values = {}) {
        const wasArray = Array.isArray(values)
        denullify(values)
        if (!wasArray) values = [values]
        for (const val of values) {
          val._id = String(val._id || fakeid && val.id || cuid())
          if (config.timestamps) val.created_at = val.updated_at = new Date()
        }
        const result = await new Promise((resolve, reject) => {
          store.insert(values, function(err, result) {
            if (err) reject(err)
            resolve(result)
          })
        })
        const ids = result.map(r => r._id)
        return wasArray
          ? { ids, n: ids.length }
          : { [fakeid ? 'id' : '_id']: ids[0] }
      },

      update: async function(query = {}, values = {}) {
        if (config.timestamps) values.updated_at = new Date()
        if (fakeid) flipid(query)

        const operation = {}
        for (const key in values) {
          if (DB_FIELD_UPDATE_OPERATORS.includes(key)) {
            operation[key] = values[key]
            delete values[key]
          } else if (values[key] == null) {
            if (!operation.$unset) operation.$unset = {}
            operation.$unset[key] = ''
          } else {
            if (!operation.$set) operation.$set = {}
            operation.$set[key] = values[key]
          }
        }

        if (!Object.keys(operation).length) return { n: 0}
        const n = await new Promise((resolve, reject) => {
          store.update(query, operation, { multi: true }, function(err, n) {
            if (err) reject(err)
            resolve(n)
          })
        })
        return { n }
      },

      delete: async function(query = {}) {
        if (fakeid) flipid(query)
        const n = await new Promise((resolve, reject) => {
          store.remove(query, { multi: true }, function(err, n) {
            if (err) reject(err)
            resolve(n)
          })
        })
        return { n }
      }
    }
  }

  db.drop = async function() {
    for (const model in stores) {
      await db(model).delete()
    }
  }

  return db
}
