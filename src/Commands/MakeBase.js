const { Command } = require('@adonisjs/ace')
const upperFirst = require('lodash/upperFirst')
const cammelCase = require('lodash/camelCase')
const pluralize = require('pluralize')
const path = require('path')

const options = {
  appDir: 'app',
  types: {
    directives: {
      path: 'Directives',
      replace: /directive/gi,
      extension: 'js',
      singular: pluralize.singular,
      after: flag => 'Directive'
    },
    schemas: {
      path: 'Schemas',
      replace: /schema/gi,
      extension: 'graphql',
      singular: x => x
    },
    gqlControllers: {
      path: 'Controllers/Gql',
      replace: /(controller|resolver)/gi,
      extension: 'js',
      singular: pluralize.singular,
      before: flag => `${flag.query ? 'Queries' : 'Mutations'}/`,
      after: flag => 'Controller'
    }
  }
}

const empty = x => ''

class MakeBase extends Command {
  async generateBlueprint (templateFor, name, flags = {}) {
    const templateFile = path.join(
      __dirname,
      '../../templates',
      `${templateFor}.mustache`
    )

    const baseName = path.basename(name)
    const normalizedName = name.replace(
      baseName,
      this.getFileName(baseName, templateFor, flags)
    )

    const filePath = path.join(
      process.cwd(),
      options.appDir,
      options.types[templateFor].path,
      `${normalizedName}.${options.types[templateFor].extension}`
    )

    const templateContents = await this.readFile(templateFile, 'utf-8')
    await this.generateFile(filePath, templateContents, {
      name: path.basename(normalizedName)
    })

    const createdFile = filePath
      .replace(process.cwd(), '')
      .replace(path.sep, '')
    console.log(
      `${this.icon('success')} ${this.chalk.green('create')}  ${createdFile}`
    )

    return {
      name: normalizedName,
      file: createdFile,
      namespace: this.getNamespace(filePath, templateFor)
    }
  }

  getFileName (name, templateFor, flag) {
    const option = options.types[templateFor]
    const { replace, singular, before = empty, after = empty } = option

    name = name.replace(replace, '')
    return `${before(flag)}${singular(upperFirst(cammelCase(name)))}${after(
      flag
    )}`
  }

  getNamespace (filePath, namespaceFor) {
    const dir = options.types[namespaceFor].path
    return `App/${dir}/${path
      .basename(filePath)
      .replace(options.types[namespaceFor].extension, '')}`
  }
}

module.exports = MakeBase
