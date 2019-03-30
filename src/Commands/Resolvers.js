'use strict'

const MakeBase = require('./MakeBase')

class Resolvers extends MakeBase {
  static get signature () {
    return `
    gql:resolver
    { name: Name of controller }
    { -q, --query: Generate only query resolver }
    { -m, --mutation: Generate only mutation resolver }
    `
  }

  static get description () {
    return 'Make a new resolver to graphql'
  }

  async handle ({ name }, { query, mutation }) {
    try {
      if (query) {
        await this.generateBlueprint('gqlControllers', name, {
          query
        })
      } else if (mutation) {
        await this.generateBlueprint('gqlControllers', name, {
          mutation
        })
      } else {
        await this.generateBlueprint('gqlControllers', name, {
          query: true
        })
        await this.generateBlueprint('gqlControllers', name, {
          mutation: true
        })
      }
    } catch (e) {
      this.error(e.message)
    }
  }
}

module.exports = Resolvers
