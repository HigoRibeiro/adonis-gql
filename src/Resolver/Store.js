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
    if (callback) {
      this._breakpoint = {
        enabled: true,
        name,
        resolvers: []
      }
      callback()
    }

    const schema = new Schema(name, this.breakpointResolvers())
    this.schemas.push(schema)

    return schema
  }

  restore () {
    this._breakpoint = {
      enabled: false,
      name: undefined,
      resolvers: []
    }
  }

  breakpointResolvers () {
    return this._breakpoint.resolvers
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

    if (this.hasBreakpoint()) {
      this._breakpoint.resolvers.push(resolver)
    }

    return resolver
  }

  resolversClear () {
    this.resolvers = new Map()
  }

  schemasClear () {
    this.schemas = []
  }
}

module.exports = new Store()
