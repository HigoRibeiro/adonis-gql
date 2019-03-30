'use strict'

const { graphqlAdonis, graphiqlAdonis } = require('apollo-server-adonis')
const {
  addMockFunctionsToSchema,
  makeExecutableSchema
} = require('graphql-tools')
const { mergeResolvers, mergeTypes } = require('merge-graphql-schemas')
const ResolverManager = require('../Resolver/Manager')
const DirectiveManager = require('../Directive/Manager')

class Server {
  constructor () {
    this.clear()
  }

  clear () {
    this.$schema = null

    this._resolvers = []
    this.$resolvers = null

    this._schemas = []
    this.$schemas = null

    this._directives = {}

    ResolverManager.clear()
    DirectiveManager.clear()
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

  _loadDirectives () {
    DirectiveManager.directives.forEach(directive => {
      this._directives[directive.name] = directive.transform()
    })
  }

  register () {
    this._loadResolversController()
    this._loadTypes()
    this._loadDirectives()

    this.$schema = makeExecutableSchema({
      typeDefs: this.$schemas,
      resolvers: this.$resolvers,
      schemaDirectives: this._directives
    })

    return this
  }

  manager () {
    return ResolverManager
  }

  managerDirective () {
    return DirectiveManager
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

  directive (...args) {
    return DirectiveManager.directive(...args)
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
    return graphiqlAdonis({
      endpointURL: '/'
    })(context)
  }
}

module.exports = Server
