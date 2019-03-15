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
//   // group.beforeEach(() => {
//   //   // this.Gql = ioc.use('Gql')
//   //   // this.Gql.schema('Unamed', () => {
//   //   //   this.Gql.query('Queries/UnamedController')
//   //   //   this.Gql.mutation('Mutations/UnamedController')
//   //   // })
//   //   // this.Gql.register()
//   //   console.log('Esse é o valor')
//   //   console.log(this.Gql)
//   //   console.log('----')
//   // })

//   test('return JSON response with posts when schema is defined', assert => {
//     // const Gql = ioc.use('Gql')
//     // Gql.schema('Unamed', () => {
//     //   Gql.query('Queries/UnamedController')
//     //   Gql.mutation('Mutations/UnamedController')
//     // })
//     // Gql.register()
//   })
// })

// // test.group('GrafQLServer', group => {
// //   group.before(async () => {
// //     console.log('hi!!')
// //     await setup()
// //   })

// //   group.after(() => {
// //     console.log(ioc)
// //     ioc.restore()
// //     const Gql = ioc.use('Adonis/Addons/GrafQLServer')
// //     console.log(Gql.$types)
// //   })

// //   group.beforeEach(() => {
// //     console.log('beforeEach')
// //     this.server = http.createServer()
// //     console.log('Pelo menos aqui desgraçado')
// //     const Gql = ioc.use('Adonis/Addons/GrafQLServer')
// //     Gql.schema('Unamed', () => {
// //       Gql.query('Queries/UnamedController')
// //       Gql.mutation('Mutations/UnamedController')
// //     })

// //     console.log('Até aqui')

// //     Gql.register()
// //     console.log('Passou!!')
// //   })

// //   test('return JSON response with posts when schema is defined', async assert => {
// //     console.log('CARALHOOOOO')
// //     assert.isTrue(true)
// //     // this.server.on('request', (req, res) => {
// //     //   const Context = ioc.use('Adonis/Src/HttpContext')

// //     //   const ctx = new Context()
// //     //   ctx.request = helpers.getRequest(req)
// //     //   ctx.response = helpers.getResponse(req, res)

// //     //   const GrafQLServer = ioc.use('Adonis/Addons/GrafQLServer')
// //     //   // GrafQLServer.setSchema(helpers.getSchema())
// //     //   GrafQLServer.handle(ctx, { mocks: true })
// //     //     .then(() => {
// //     //       res.writeHead(200, { 'content-type': 'application/json' })

// //     //       res.write(JSON.stringify(ctx.response.cache))
// //     //       res.end()
// //     //     })
// //     //     .catch(() => {
// //     //       res.writeHead(500)
// //     //       res.write(ctx.response.cache)
// //     //       res.end()
// //     //     })
// //     // })

// //     // const { text } = await supertest(this.server)
// //     //   .get('/')
// //     //   .query({ query: '{ posts { title } }' })
// //     //   .expect(200)

// //     // assert.equal(
// //     //   text,
// //     //   '{"data":{"posts":[{"title":"Hello World"},{"title":"Hello World"}]}}'
// //     // )
// //   })
// // })
