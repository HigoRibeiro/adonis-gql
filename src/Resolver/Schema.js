'use strict'

const { readFileSync } = require('fs')

class Schema {
  constructor (name, resolvers) {
    this.name = name
    this._resolvers = resolvers
  }

  _getSchemaFile () {
    global.iocResolver._directories.schemas = 'Schemas'
    const namespace = global.iocResolver.forDir('schemas').translate(this.name)
    return readFileSync(`${namespace}.graphql`, 'utf-8')
  }

  transform () {
    const schema = this._getSchemaFile()
    return schema
  }

  middleware (middlewareList) {
    this._resolvers.forEach(resolver => {
      resolver.registerMiddleware(middlewareList)
    })
    return this
  }
}

module.exports = Schema
