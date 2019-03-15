'use strict'

class Resolver {
  constructor (name, Controller, type = 'Query') {
    this.Controller = Controller
    this._resolverControllerMethods = []
    this.type = this._normalizeType(type)
    this.name = `${name}:${this.type}`
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

  transform () {
    const Resolver = this._getResolverController()
    const resolverMethods = this._getResolverControllerMethods(Resolver)

    const resolver = new Resolver()
    const resolvers = {}
    resolverMethods.forEach(method => {
      resolvers[method] = resolver[method].bind(resolver)
    })

    return {
      [this.type]: resolvers
    }
  }
}

module.exports = Resolver
