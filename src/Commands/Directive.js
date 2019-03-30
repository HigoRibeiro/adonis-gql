'use strict'

const MakeBase = require('./MakeBase')

class Directive extends MakeBase {
  static get signature () {
    return `
    gql:directive
    { name: Name of directive }
    `
  }

  static get description () {
    return 'Make a new directive to graphql'
  }

  async handle ({ name }, { query, mutation }) {
    try {
      await this.generateBlueprint('directives', name)
    } catch (e) {
      this.error(e.message)
    }
  }
}

module.exports = Directive
