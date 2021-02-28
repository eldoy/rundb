const fs = require('fs')
const path = require('path')
const Store = require('nedb')

const cuid = require('cuid')
const _ = require('lodash')

const DEFAULT_CONFIG = {
  dir: 'tmp/db'
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
    if (!stores[model]) {
      const filename = path.join(config.dir, `${model}.db`)
      stores[model] = new Store({ filename })
    }
    const store = stores[model]

    return {
      find: async function(query = {}, options = {}) {
      },

      get: async function(query = {}, options = {}) {
      },

      count: async function(query = {}, options = {}) {
        const count = await new Promise((resolve, reject) => {
          store.count(query, function(err, n) {
            if (err) reject(err)
            resolve(n)
          })
        })
        return count
      },

      create: async function(values = {}) {
        const doc = await new Promise((resolve, reject) => {
          store.insert(values, function(err, doc) {
            if (err) reject(err)
            resolve(doc)
          })
        })
        return doc
      },

      update: async function(query = {}, values = {}) {
      },

      delete: async function(query = {}) {
        const count = await new Promise((resolve, reject) => {
          store.remove(query, { multi: true }, function(err, n) {
            if (err) reject(err)
            resolve(n)
          })
        })
        return count
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
