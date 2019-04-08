'use strict'

class Resolver {
  constructor (name, Controller, type = 'Query') {
    this.Controller = Controller
    this._resolverControllerMethods = []
    this.type = this._normalizeType(type)
    this.name = `${name}:${this.type}`
    this.middlewaresFn = {}
  }

  _normalizeType (type) {
    return type.replace(/^\w/, match => match.toUpperCase())
  }

  _getResolverController () {
    global.iocResolver._directories.gqlControllers = 'Controllers/Gql'
    const namespace = global.iocResolver
      .forDir('gqlControllers')
      .translate(this.Controller)
    return global.use(namespace)
  }

  _getResolverControllerMethods (Resolver) {
    if (!this._resolverControllerMethods.length) {
      this._resolverControllerMethods = Object.getOwnPropertyNames(
        Resolver.prototype
      ).filter(method => method !== 'constructor' && !method.startsWith('$'))
    }

    return this._resolverControllerMethods
  }

  _normalizeMiddleware (middleware) {
    return Array.isArray(middleware) ? middleware : [middleware]
  }

  middleware (middleware) {
    this.registerMiddleware(middleware)
  }

  registerMiddleware (middleware) {
    const Resolver = this._getResolverController()
    this._registerMiddlewareToAllMethods(Resolver, middleware)

    return this
  }

  _registerMiddlewareToAllMethods (Resolver, middleware) {
    const resolverMethods = this._getResolverControllerMethods(Resolver)

    resolverMethods.forEach(method => {
      const middlewares = this.middlewaresFn[method] || []

      this.middlewaresFn[method] = middlewares.concat(
        this._normalizeMiddleware(middleware)
      )
    })
  }

  _getMiddlewares (Resolver) {
    try {
      const middlewares = Resolver.middlewares()
      if (middlewares.hasOwnProperty('all')) {
        this._registerMiddlewareToAllMethods(Resolver, middlewares.all)
        delete middlewares.all
      }

      const keys = Object.keys(middlewares)
      keys.forEach(key => {
        if (!this.middlewaresFn.hasOwnProperty(key)) {
          this.middlewaresFn[key] = []
        }

        const middlewareList = this._normalizeMiddleware(middlewares[key])
        this.middlewaresFn[key] = this.middlewaresFn[key].concat(middlewareList)
      })
    } catch (err) {
      return {}
    }
  }

  get middlewares () {
    return { [this.type]: this.middlewaresFn }
  }

  transform () {
    const Resolver = this._getResolverController()
    const resolverMethods = this._getResolverControllerMethods(Resolver)

    const resolver = new Resolver()
    const resolvers = {}
    resolverMethods.forEach(method => {
      resolvers[method] = resolver[method].bind(resolver)
    })

    this._getMiddlewares(Resolver)

    return {
      [this.type]: resolvers
    }
  }
}

module.exports = Resolver
