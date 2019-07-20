'use strict'

const test = require('japa')
const { ioc } = require('@adonisjs/fold')
const mock = require('mock-fs')
const http = require('http')
const supertest = require('supertest')
const setup = require('./setup')
const helpers = require('../unit/helpers')

test.group('GrafQLServer', group => {
  group.before(async () => {
    await setup()
    this.Gql = ioc.use('Gql')
    global.iocResolver.appNamespace('App')
    mock({
      'App/Schemas/Unamed.graphql':
        'type Query { name: String } type Mutation { addName: String }',
      'App/Schemas/Post.graphql': `type Post {
        name: String
        date: String @deprecated(reason: "Use \`datetime\`")
        datetime: String
      }

      type Query {
        post: Post
      }`
    })
  })

  group.beforeEach(() => {
    this.server = http.createServer()
  })

  group.afterEach(() => {
    this.Gql.clear()
  })
  group.after(mock.restore)

  test('return status 500 when schema has not been defined', async assert => {
    this.server.on('request', (req, res) => {
      const Context = ioc.use('Adonis/Src/HttpContext')

      const ctx = new Context()
      ctx.request = helpers.getRequest(req)
      ctx.response = helpers.getResponse(req, res)

      try {
        this.Gql.handle(ctx).then(() => {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.end()
        })
      } catch (err) {
        res.writeHead(500)
        res.write(err.message)
        res.end()
      }
    })

    const { text } = await supertest(this.server)
      .get('/')
      .query({ query: '{ posts { title } }' })
      .expect(500)

    assert.equal(text, 'Schema has not been defined')
  })

  test('return JSON response with posts when schema is defined and resolver are mocks', async assert => {
    this.Gql.schema('Unamed', () => { })
    this.Gql.register()

    this.server.on('request', (req, res) => {
      const Context = ioc.use('Adonis/Src/HttpContext')

      const ctx = new Context()
      ctx.request = helpers.getRequest(req)
      ctx.response = helpers.getResponse(req, res)

      try {
        this.Gql.handle(ctx, { mocks: true }).then(() => {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.write(JSON.stringify(ctx.response.cache))
          res.end()
        })
      } catch (err) {
        res.writeHead(500)
        res.write(err.message)
        res.end()
      }
    })

    const { text } = await supertest(this.server)
      .get('/')
      .query({ query: '{ name }' })
      .expect(200)

    assert.equal(text, '{"data":{"name":"Hello World"}}')
  })

  test('return JSON response with directives is defined', async assert => {
    ioc.bind('App/Controllers/Gql/Queries/PostController', () => {
      return class PostController {
        async post (_, __, ___) {
          return {
            name: 'AdonisGql',
            date: '29-03-2019',
            datetime: '29-03-2019 23:42:11'
          }
        }
      }
    })

    const SchemaDirectiveVisitor = ioc.use('SchemaDirectiveVisitor')

    ioc.bind('App/Directives/DeprecatedDirective', () => {
      return class DeprecatedDirective extends SchemaDirectiveVisitor {
        visitEnumValue (field) {
          field.isDeprecated = true
          field.deprecationReason = this.args.reason
        }

        visitFieldDefinition (field) {
          field.isDeprecated = true
          field.deprecationReason = this.args.reason
        }
      }
    })

    this.Gql.schema('Post', () => {
      this.Gql.query('Queries/PostController')
    })

    this.Gql.directive('deprecated', 'DeprecatedDirective')

    this.Gql.register()

    this.server.on('request', (req, res) => {
      const Context = ioc.use('Adonis/Src/HttpContext')

      const ctx = new Context()
      ctx.request = helpers.getRequest(req)
      ctx.response = helpers.getResponse(req, res)

      try {
        this.Gql.handle(ctx).then(() => {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.write(JSON.stringify(ctx.response.cache))
          res.end()
        })
      } catch (err) {
        res.writeHead(500)
        res.write(err.message)
        res.end()
      }
    })

    const { body } = await supertest(this.server)
      .get('/')
      .query({ query: '{ __type(name: "Post") { name fields { name } } }' })
      .expect(200)

    const {
      data: {
        __type: { fields }
      }
    } = body

    assert.deepInclude(fields, { name: 'name' })
    assert.deepInclude(fields, { name: 'datetime' })
    assert.notDeepInclude(fields, { name: 'date' })
    assert.lengthOf(fields, 2)
  })

  test('return JSON response with named middleware', async assert => {
    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {
        const result = await resolve(root, args, context, info)

        return {
          ...result,
          name: 'Higo'
        }
      }
    }

    ioc.bind('Adonis/Middleware/ChangeName', () => {
      return new Middleware()
    })

    ioc.bind('App/Controllers/Gql/Queries/PostController', () => {
      return class PostController {
        async post (_, __, ___) {
          return {
            name: 'AdonisGql',
            date: '29-03-2019',
            datetime: '29-03-2019 23:42:11'
          }
        }
      }
    })

    this.Gql.registerNamed({
      change: 'Adonis/Middleware/ChangeName'
    })

    this.Gql.schema('Post', () => {
      this.Gql.query('Queries/PostController').middleware(['change'])
    })

    this.Gql.register()

    this.server.on('request', (req, res) => {
      const Context = ioc.use('Adonis/Src/HttpContext')

      const ctx = new Context()
      ctx.request = helpers.getRequest(req)
      ctx.response = helpers.getResponse(req, res)

      try {
        this.Gql.handle(ctx).then(() => {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.write(JSON.stringify(ctx.response.cache))
          res.end()
        })
      } catch (err) {
        res.writeHead(500)
        res.write(err.message)
        res.end()
      }
    })

    const { text } = await supertest(this.server)
      .get('/')
      .query({ query: '{ post { name }}' })
      .expect(200)

    assert.equal(text, '{"data":{"post":{"name":"Higo"}}}')
  })

  test('return JSON response with global middleware', async assert => {
    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {
        return 'fake'
      }
    }

    ioc.bind('Adonis/Middleware/Fake', () => {
      return new Middleware()
    })

    this.Gql.schema('Unamed', () => {
      this.Gql.query('Queries/UnamedController')
    })

    this.Gql.registerGlobal(['Adonis/Middleware/Fake'])

    this.Gql.register()

    this.server.on('request', (req, res) => {
      const Context = ioc.use('Adonis/Src/HttpContext')

      const ctx = new Context()
      ctx.request = helpers.getRequest(req)
      ctx.response = helpers.getResponse(req, res)

      try {
        this.Gql.handle(ctx).then(() => {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.write(JSON.stringify(ctx.response.cache))
          res.end()
        })
      } catch (err) {
        res.writeHead(500)
        res.write(err.message)
        res.end()
      }
    })

    const { text } = await supertest(this.server)
      .get('/')
      .query({ query: '{ name }' })
      .expect(200)

    assert.equal(text, '{"data":{"name":"fake"}}')
  })
})
