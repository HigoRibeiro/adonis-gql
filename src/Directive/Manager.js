'use strict'

const Directive = require('./index')

class DirectiveManager {
  constructor () {
    this.directives = new Map()
  }

  directive (name, directive) {
    const directiveInstance = new Directive(name, directive)
    this.directives.set(name, directiveInstance)
  }

  clear () {
    this.directives = new Map()
  }
}

module.exports = new DirectiveManager()
