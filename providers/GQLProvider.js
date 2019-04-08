'use strict'

const { ServiceProvider } = use('@adonisjs/fold')
const { SchemaDirectiveVisitor } = require('graphql-tools')

const GqlServer = require('../src/Server')

class GQLProvider extends ServiceProvider {
  _registerGQL () {
    this.app.singleton('Adonis/Addons/GqlServer', () => {
      return new GqlServer()
    })

    this.app.alias('Adonis/Addons/GqlServer', 'Gql')
    this.app.bind('SchemaDirectiveVisitor', () => SchemaDirectiveVisitor)
  }

  _registerCommands () {
    this.app.bind('Adonis/Commands/GqlSchema', () => {
      return require('../src/Commands/Schema.js')
    })

    this.app.bind('Adonis/Commands/GqlController', () => {
      return require('../src/Commands/Resolvers.js')
    })

    this.app.bind('Adonis/Commands/GqlDirective', () => {
      return require('../src/Commands/Directive.js')
    })

    this.app.bind('Adonis/Commands/GqlMiddleware', () => {
      return require('../src/Commands/Middleware.js')
    })
  }

  register () {
    this._registerCommands()
  }

  boot () {
    this._registerGQL()

    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/GqlSchema')
    ace.addCommand('Adonis/Commands/GqlController')
    ace.addCommand('Adonis/Commands/GqlDirective')
    ace.addCommand('Adonis/Commands/GqlMiddleware')
  }
}

module.exports = GQLProvider
