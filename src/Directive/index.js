'use strict'

class Directive {
  constructor (name, Directive) {
    this.name = name
    this.Directive = Directive
  }

  _getDirectiveFile () {
    global.iocResolver._directories.directives = 'Directives'
    const namespace = global.iocResolver
      .forDir('directives')
      .translate(this.Directive)
    return global.use(namespace)
  }

  transform () {
    const Directive = this._getDirectiveFile()
    return Directive
  }
}

module.exports = Directive
