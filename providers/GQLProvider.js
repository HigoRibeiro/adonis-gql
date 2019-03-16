const { ServiceProvider } = require.main.require('@adonisjs/fold')

const GqlServer = require('../src/Server')

class GrafQLProvider extends ServiceProvider {
  _registerGrafQL () {
    this.app.singleton('Adonis/Addons/GqlServer', () => {
      const Config = use('Adonis/Src/Config')
      return new GqlServer(Config)
    })
    this.app.alias('Adonis/Addons/GqlServer', 'Gql')
  }

  boot () {
    this._registerGrafQL()
  }
}

module.exports = GrafQLProvider
