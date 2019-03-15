'use strict'

const Schema = require('./Schema')
const Resolver = require('./index')

class Store {
  constructor () {
    this.resolvers = new Map()
    this.schemas = []
    this.restore()
  }

  _normalizeType (type) {
    return type.replace(/^\w/, match => match.toUpperCase())
  }

  hasBreakpoint () {
    return this._breakpoint.enabled
  }

  schema (name, callback) {
    const schema = new Schema(name)

    if (callback) {
      this._breakpoint = {
        enabled: true,
        name
      }
      callback()
    }

    this.schemas.push(schema)

    return schema
  }

  restore () {
    this._breakpoint = {
      enabled: false,
      name: undefined
    }
  }

  resolver (name, Controller, type = 'Query') {
    if (this.hasBreakpoint()) {
      type = Controller || type
      Controller = name
      name = this._breakpoint.name
    }

    let _type = this._normalizeType(type)
    const resolver = new Resolver(name, Controller, _type)
    this.resolvers.set(`${name}:${_type}`, resolver)
  }

  resolversClear () {
    this.resolvers = new Map()
  }

  schemasClear () {
    this.schemas = []
  }
}

module.exports = new Store()
