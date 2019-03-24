const fs = require('fs')
const path = require('path')

module.exports = {
  getSchemaContent () {
    return `type Post {\n\n}\n\ntype Query {\n\n}\n\ntype Mutation {\n\n}`
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
