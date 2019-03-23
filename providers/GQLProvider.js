'use strict'

const { ServiceProvider } = use('@adonisjs/fold')

const GqlServer = require('../src/Server')

class GQLProvider extends ServiceProvider {
  _registerGrafQL () {
    this.app.singleton('Adonis/Addons/GqlServer', () => {
      const Config = use('Adonis/Src/Config')
      return new GqlServer(Config)
    })
    this.app.alias('Adonis/Addons/GqlServer', 'Gql')
  }

  _registerCommands () {
    this.app.bind('Adonis/Commands/GqlSchema', () => {
      return require('../src/Commands/Schema.js')
    })

    this.app.bind('Adonis/Commands/GqlController', () => {
      return require('../src/Commands/Resolvers.js')
    })
  }

  register () {
    this._registerCommands()
  }

  boot () {
    this._registerGrafQL()

    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/GqlSchema')
    ace.addCommand('Adonis/Commands/GqlController')
  }
}

module.exports = GQLProvider
