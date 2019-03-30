const test = require('japa')
const setup = require('./setup')
const ace = require('@adonisjs/ace')
const mock = require('mock-fs')
const fs = require('fs')

const {
  getSchemaContent,
  getPostController,
  getDirectiveContent,
  getTemplate
} = require('./helpers')

const schemaTemplate = getTemplate()
const gqlControllerTemplate = getTemplate('gqlControllers')
const directiveTemplate = getTemplate('directives')

test.group('Commands | Schema', group => {
  group.before(async () => {
    await setup()
  })

  group.beforeEach(() => {
    mock({
      'templates/schemas.mustache': schemaTemplate,
      'templates/gqlControllers.mustache': gqlControllerTemplate,
      'templates/directives.mustache': directiveTemplate
    })
  })

  group.afterEach(() => {
    mock.restore()
  })

  test('create a schema file', async assert => {
    await ace.call('gql:schema', { name: 'Post' })

    const schema = fs.readFileSync('app/Schemas/Post.graphql', 'utf-8')
    assert.equal(schema, getSchemaContent())
  })

  test('create a resolve file', async assert => {
    await ace.call('gql:resolver', { name: 'Post' })
    const queryPostController = fs.readFileSync(
      'app/Controllers/Gql/Queries/PostController.js',
      'utf-8'
    )
    const mutationPostController = fs.readFileSync(
      'app/Controllers/Gql/Mutations/PostController.js',
      'utf-8'
    )

    const controller = getPostController()

    assert.equal(queryPostController, controller)
    assert.equal(mutationPostController, controller)
  })

  test('create a resolve file only query', async assert => {
    await ace.call('gql:resolver', { name: 'Post' }, { query: true })
    const queryPostController = fs.readFileSync(
      'app/Controllers/Gql/Queries/PostController.js',
      'utf-8'
    )

    const fileNotExist = fs.existsSync(
      'app/Controllers/Gql/Mutations/PostController.js'
    )

    const controller = getPostController()

    assert.equal(queryPostController, controller)
    assert.isFalse(fileNotExist)
  })

  test('create a resolve file only mutation', async assert => {
    await ace.call('gql:resolver', { name: 'Post' }, { mutation: true })
    const mutationPostController = fs.readFileSync(
      'app/Controllers/Gql/Mutations/PostController.js',
      'utf-8'
    )

    const fileNotExist = fs.existsSync(
      'app/Controllers/Gql/Queries/PostController.js'
    )

    const controller = getPostController()

    assert.equal(mutationPostController, controller)
    assert.isFalse(fileNotExist)
  })

  test('create a directive file', async assert => {
    await ace.call('gql:directive', { name: 'Deprecated' })

    const directive = fs.readFileSync(
      'app/Directives/DeprecatedDirective.js',
      'utf-8'
    )

    assert.equal(directive, getDirectiveContent())
  })
})
