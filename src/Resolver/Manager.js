'use strict'

const Store = require('./Store')

class ResolverManager {
  mutation (name, Controller) {
    const mutation = Store.resolver(name, Controller, 'Mutation')
    return mutation
  }

  query (...args) {
    const query = Store.resolver(...args)
    return query
  }

  schema (name, callback) {
    const schema = Store.schema(name, callback)
    Store.restore()
    return schema
  }

  get resolvers () {
    return Store.resolvers
  }

  get schemas () {
    return Store.schemas
  }

  clear () {
    Store.resolversClear()
    Store.schemasClear()
  }
}

module.exports = new ResolverManager()
