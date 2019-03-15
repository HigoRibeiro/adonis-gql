const { ServiceProvider } = require.main.require('@adonisjs/fold')

const GrafQLServer = require('../src/Server')

class GrafQLProvider extends ServiceProvider {
  _registerGrafQL () {
    this.app.singleton('Adonis/Addons/GrafQLServer', () => {
      const Config = use('Adonis/Src/Config')
      return new GrafQLServer(Config)
    })
    this.app.alias('Adonis/Addons/GrafQLServer', 'Gql')
  }

  boot () {
    this._registerGrafQL()
  }
}

module.exports = GrafQLProvider
