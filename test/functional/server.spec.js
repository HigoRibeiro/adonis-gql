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
        'type Query { name: String } type Mutation { addName: String }'
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
    this.Gql.schema('Unamed', () => {})
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
  test('return JSON response with posts when schema is defined', assert => {})
})
