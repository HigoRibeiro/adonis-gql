const fs = require('fs')
const path = require('path')

module.exports = {
  getSchemaContent () {
    return `Query {\n\n}\n\nMutation {\n\n}`
  },
  getTemplate (name = 'schemas') {
    const data = fs.readFileSync(
      path.join(process.cwd(), `templates/${name}.mustache`),
      'utf-8'
    )
    return data
  },

  getPostController () {
    return `'use strict'\n\nclass PostController {\n}\n\nmodule.exports = PostController\n`
  }
}
