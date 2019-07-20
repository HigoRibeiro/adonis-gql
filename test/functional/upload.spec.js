'use strict'

const test = require('japa')
const { ioc } = require('@adonisjs/fold')
const mock = require('mock-fs')
const http = require('http')
const supertest = require('supertest')
const setup = require('./setup')
const BodyParser = require('@adonisjs/bodyparser/src/BodyParser')
const { HttpContext } = require('@poppinss/http-server')

const UploadMiddleware = require('../../src/Middleware/Upload')

test.group('GrafQLServer', group => {
  group.before(async () => {
    await setup()
    this.Gql = ioc.use('Gql')
    global.iocResolver.appNamespace('App')
    mock({
      'App/Schemas/File.graphql':
        `scalar Upload
        
        type File {
          id: ID!
          path: String!
          filename: String!
          mimetype: String!
          encoding: String!
        }

        type Query {
          test: String
        }

        type Mutation {
          singleUpload(file: Upload!): File! 
          multipleUpload(files: [Upload!]!): [File!]!
        }`,

      'package.json': 'file'
    })
  })

  group.afterEach(() => {
    this.Gql.clear()
  })

  group.after(mock.restore)

  test('upload single file', async assert => {
    ioc.bind('App/Controllers/Gql/Mutations/FileController', () => {
      return class PostController {
        async singleUpload() {
          return {
            id: 1
          }
        }
      }
    })

    ioc.bind('App/Controllers/Gql/Queries/FileController', () => {
      return class {
        async test() {
          return '1'
        }
      }
    })

    this.Gql.schema('File', () => {
      this.Gql.mutation('Mutations/FileController')
      this.Gql.query('Queries/FileController')
    })

    this.Gql.register()

    const config = ioc.use('Adonis/Src/Config')

    config.set('bodyParser', {
      files: {
        types: [
          'multipart/form-data'
        ],
        maxSize: '20mb',

        autoProcess: false,

        processManually: []
      }
    })

    const server = http.createServer(async (req, res) => {
      const ctx = HttpContext.create('/', {}, req, res)

      const bodyParser = new BodyParser(config)
      await bodyParser.handle(ctx, async () => {
        const upload = new UploadMiddleware()
        await upload.handle(ctx, async () => {
          try {
            await this.Gql.handle(ctx)
          } catch (err) {
            res.writeHead(500)
            res.end()
          }
        })
      })
      res.end()
    })

    const body = await supertest(server)
      .post('/')
      .field('operations', '{ "query": "mutation ($file: Upload!) { singleUpload(file: $file) { id } }", "variables": { "file": null } }')
      .field('map', '{ "0": ["variables.file"] }')
      .attach('0', 'package.json')

    const { text } = body

    assert.equal(text, '{"data":{"singleUpload":{"id":"1"}}}')
  })

  test('upload multiple file', async assert => {
    ioc.bind('App/Controllers/Gql/Mutations/FileController', () => {
      return class PostController {
        async multipleUpload() {
          return [{
            id: 1
          }, {
            id: 2
          }]
        }
      }
    })

    ioc.bind('App/Controllers/Gql/Queries/FileController', () => {
      return class {
        async test() {
          return '1'
        }
      }
    })

    this.Gql.schema('File', () => {
      this.Gql.mutation('Mutations/FileController')
      this.Gql.query('Queries/FileController')
    })

    this.Gql.register()

    const config = ioc.use('Adonis/Src/Config')

    config.set('bodyParser', {
      files: {
        types: [
          'multipart/form-data'
        ],
        maxSize: '20mb',

        autoProcess: false,

        processManually: []
      }
    })

    const server = http.createServer(async (req, res) => {
      const ctx = HttpContext.create('/', {}, req, res)

      const bodyParser = new BodyParser(config)
      await bodyParser.handle(ctx, async () => {
        const upload = new UploadMiddleware()
        await upload.handle(ctx, async () => {
          try {
            await this.Gql.handle(ctx)
          } catch (err) {
            res.writeHead(500)
            res.end()
          }
        })
      })
      res.end()
    })

    const body = await supertest(server)
      .post('/')
      .field('operations', '{ "query": "mutation ($files: [Upload!]!) { multipleUpload(files: $files) { id } }", "variables": { "files": [null, null] } }')
      .field('map', '{ "0": ["variables.files.0"], "1": ["variables.files.1"] }')
      .attach('0', 'package.json')
      .attach('1', 'package.json')

    const { text } = body

    assert.equal(text, '{"data":{"multipleUpload":[{"id":"1"},{"id":"2"}]}}')
  })
})
