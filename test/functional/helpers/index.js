const fs = require('fs')
const path = require('path')

module.exports = {
  getDirectiveContent () {
    return `'use strict'\n\nconst SchemaDirectiveVisitor = use('SchemaDirectiveVisitor')\n\nclass DeprecatedDirective extends SchemaDirectiveVisitor {\n}\n\nmodule.exports = DeprecatedDirective\n`
  },
  getSchemaContent () {
    return `type Post {\n\n}\n\ntype Query {\n\n}\n\ntype Mutation {\n\n}`
  },
  getMiddlewareContent () {
    return `'use strict'\n\nclass Auth {\n  async gqlHandle (resolve, root, args, ctx, info) {\n    const result = await resolve(parent, args, ctx, info)\n    return result\n  }\n}\n\nmodule.exports = Auth\n`
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
