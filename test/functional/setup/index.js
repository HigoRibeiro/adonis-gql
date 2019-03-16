'use strict'

const { ioc, registrar } = require('@adonisjs/fold')
const { Config } = require('@adonisjs/sink')
const path = require('path')
const { Macroable } = require('macroable')

class Context extends Macroable {
  static onReady () {}
}
Context._getters = {}
Context._macros = {}

class UnamedController {
  name (parent, args, ctx) {}
}

class MutationUnamedController {
  addName (parent, args, ctx) {}
}

module.exports = async () => {
  ioc.bind('Adonis/Src/HttpContext', () => {
    return Context
  })

  ioc.bind('Adonis/Src/Config', () => {
    const config = new Config()

    config.set('grafql', {
      kernel: 'gqlKernel'
    })

    return config
  })

  ioc.bind('App/Controllers/Gql/Queries/UnamedController', () => {
    return UnamedController
  })

  ioc.bind('App/Controllers/Gql/Mutations/UnamedController', () => {
    return MutationUnamedController
  })

  await registrar
    .providers([path.join(__dirname, '../../../providers/GQLProvider')])
    .registerAndBoot()
}
