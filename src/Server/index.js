'use strict'

const { graphqlAdonis, graphiqlAdonis } = require('apollo-server-adonis')
const { applyMiddleware } = require('graphql-middleware')
const {
  addMockFunctionsToSchema,
  makeExecutableSchema
} = require('graphql-tools')
const merge = require('lodash/mergeWith')

const { resolver } = require('@adonisjs/fold')

const { mergeResolvers, mergeTypes } = require('merge-graphql-schemas')
const ResolverManager = require('../Resolver/Manager')
const DirectiveManager = require('../Directive/Manager')

const Middleware = require('../Middleware')

const map = (obj, callback) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const el = obj[key]
      callback(obj, el, key)
    }
  }
}

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

    this.$middleware = []

    ResolverManager.clear()
    DirectiveManager.clear()
    Middleware._middleware.global = []
    Middleware._middleware.named = []
  }

  _makeMiddleware (middleware, type) {
    const middlewareList = []
    map(middleware, (_, element, key) => {
      const middlewareFn = {}
      element.resolvers.forEach(resolver => {
        middlewareFn[resolver] = element.instance.method
      })
      middlewareList.push({ [type]: middlewareFn })
    })

    return middlewareList
  }

  _transformRawMiddleware (middleware) {
    try {
      const middlewareList = {}
      map(middleware, (_, element, key) => {
        element.forEach(midName => {
          if (!middlewareList.hasOwnProperty(midName)) {
            const middleware = Middleware._middleware.named[midName]
            const handleInstance = resolver.resolveFunc(
              Middleware._middleware.named[midName].namespace
            )

            middlewareList[midName] = {
              resolvers: [key],
              instance: handleInstance,
              params: middleware.params
            }
          } else {
            middlewareList[midName].resolvers.push(key)
          }
        })
      })

      return middlewareList
    } catch (err) { }
  }

  _loadNamedMiddlewares (middleware) {
    const middlewareList = middleware.reduce((prev, curr) => {
      return merge(prev, curr)
    }, {})

    map(middlewareList, (_, middleware, key) => {
      const transformedMiddleware = this._transformRawMiddleware(middleware)
      this.$middleware = this.$middleware.concat(
        this._makeMiddleware(transformedMiddleware, key)
      )
    })
  }

  _loadGlobalMiddlewares () {
    Middleware._middleware.global.forEach(middleware => {
      const handleInstance = resolver.resolveFunc(middleware.namespace)

      this.$middleware.push(handleInstance.method)
    })
  }

  _loadResolversController () {
    const middleware = []
    ResolverManager.resolvers.forEach(resolver => {
      this._resolvers.push(resolver.transform())
      middleware.push(resolver.middlewares)
    })

    this._loadGlobalMiddlewares()

    this._loadNamedMiddlewares(middleware)

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

    const schema = makeExecutableSchema({
      typeDefs: this.$schemas,
      resolvers: this.$resolvers,
      schemaDirectives: this._directives
    })

    this.$schema = applyMiddleware(schema, ...this.$middleware)

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

  registerGlobal (list) {
    Middleware.registerGlobal(list)
    return this
  }

  registerNamed (list) {
    Middleware.registerNamed(list)
    return this
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
