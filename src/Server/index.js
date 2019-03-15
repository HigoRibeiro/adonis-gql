'use strict'

const { graphqlAdonis, graphqliAdonis } = require('apollo-server-adonis')
const {
  addMockFunctionsToSchema,
  makeExecutableSchema
} = require('graphql-tools')
const { mergeResolvers, mergeTypes } = require('merge-graphql-schemas')
const ResolverManager = require('../Resolver/Manager')

class Server {
  constructor (config) {
    this.config = config

    this.clear()
  }

  clear () {
    this.$schema = null

    this._resolvers = []
    this.$resolvers = null

    this._schemas = []
    this.$schemas = null

    ResolverManager.clear()
  }

  _loadResolversController () {
    ResolverManager.resolvers.forEach(resolver => {
      this._resolvers.push(resolver.transform())
    })

    this.$resolvers = mergeResolvers(this._resolvers)
  }

  _loadTypes () {
    ResolverManager.schemas.forEach(schema => {
      this._schemas.push(schema.transform())
    })

    this.$schemas = mergeTypes(this._schemas)
  }

  register () {
    this._loadResolversController()
    this._loadTypes()

    this.$schema = makeExecutableSchema({
      typeDefs: this.$schemas,
      resolvers: this.$resolvers
    })

    return this
  }

  manager () {
    return ResolverManager
  }

  schema (...args) {
    return ResolverManager.schema(...args)
  }

  query (...args) {
    return ResolverManager.query(...args)
  }

  mutation (...args) {
    return ResolverManager.mutation(...args)
  }

  handle (context, options = {}) {
    if (!this.$schema) {
      throw new Error('Schema has not been defined')
    }

    if (options.mocks) {
      addMockFunctionsToSchema({
        schema: this.$schema,
        preserveResolvers: false
      })
    }

    return graphqlAdonis({
      context,
      schema: this.$schema
    })(context)
  }

  handleUi (context) {
    return graphqliAdonis({
      endpointURL: '/'
    })(context)
  }
}

module.exports = Server
