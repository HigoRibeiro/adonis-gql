'use strict'

const { readFileSync } = require('fs')

class Schema {
  constructor (name) {
    this.name = name
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
}

module.exports = Schema
