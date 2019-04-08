'use strict'

const { ioc } = require('@adonisjs/fold')
const test = require('japa')
const mock = require('mock-fs')
const setup = require('../functional/setup')

const Schema = require('../../src/Resolver/Schema')
const Resolver = require('../../src/Resolver')
const Directive = require('../../src/Directive')

const middleware = require('../../src/Middleware')

test.group('Server', group => {
  group.before(async () => {
    await setup()
  })

  group.beforeEach(() => {
    ioc.restore()
    ioc.use('Gql').clear()
    mock({
      'App/Schemas/Unamed.graphql':
        'type Query { name: String } type Mutation { addName: String }',
      'App/Schemas/UserMiddleware.graphql':
        'type Query { user: String, users: [String] }'
    })

    middleware._middleware.global = []
    middleware._middleware.named = {}
  })

  group.afterEach(mock.restore)

  test('defining schema and resolvers', assert => {
    const Gql = ioc.use('Gql')

    Gql.schema('Unamed', () => {
      Gql.query('UnamedController')
    })

    const Manager = Gql.manager()
    assert.instanceOf(Manager.schemas[0], Schema)
    assert.equal(
      'type Query { name: String } type Mutation { addName: String }',
      Manager.schemas[0].transform()
    )
    assert.instanceOf(Manager.resolvers.get('Unamed:Query'), Resolver)
    assert.equal(Manager.resolvers.get('Unamed:Query').name, 'Unamed:Query')
  })

  test('register after resolvers and schemas are defined', assert => {
    const Gql = ioc.use('Gql')
    Gql.schema('Unamed', () => {
      Gql.query('Queries/UnamedController')
      Gql.mutation('Mutations/UnamedController')
    })

    Gql.register()

    assert.property(Gql.$resolvers, 'Query')
    assert.property(Gql.$resolvers, 'Mutation')
    assert.property(Gql.$resolvers.Query, 'name')
    assert.property(Gql.$resolvers.Mutation, 'addName')

    assert.isString(Gql.$schemas)
  })

  test('throw exception when makeExecutable is null', assert => {
    const Gql = ioc.use('Gql')
    const handle = () => Gql.handle()
    assert.throw(handle, 'Schema has not been defined')
  })

  test('defining directive', assert => {
    const Gql = ioc.use('Gql')

    Gql.directive('deprecated', 'DeprecatedDirective')

    const Manager = Gql.managerDirective()
    assert.instanceOf(Manager.directives.get('deprecated'), Directive)
  })

  test('register global middleware', assert => {
    const Gql = ioc.use('Gql')
    Gql.registerGlobal(['Adonis/Middleware/AuthInit'])

    assert.deepEqual(middleware._middleware.global, [
      {
        namespace: 'Adonis/Middleware/AuthInit.gqlHandle',
        params: []
      }
    ])
  })

  test('register named middleware', assert => {
    const Gql = ioc.use('Gql')

    Gql.registerNamed({
      auth: 'Adonis/Middleware/Auth'
    })

    assert.deepEqual(middleware._middleware.named, {
      auth: { namespace: 'Adonis/Middleware/Auth.gqlHandle', params: [] }
    })
  })

  test('global middleware execution', assert => {
    const Gql = ioc.use('Gql')

    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {}
    }

    ioc.bind('Adonis/Middleware/Auth', () => {
      return new Middleware()
    })

    class UserMiddlewareController {
      user (parent, args, ctx) {}
      users (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/UserMiddlewareController', () => {
      return UserMiddlewareController
    })

    Gql.schema('UserMiddleware', () => {
      Gql.query('UserMiddlewareController')
    })

    Gql.registerGlobal(['Adonis/Middleware/Auth'])

    Gql.register()

    assert.isFunction(Gql.$middleware[0])
  })

  test('middleware registered on controller', assert => {
    const Gql = ioc.use('Gql')

    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {}
    }

    ioc.bind('Adonis/Middleware/Auth', () => {
      return new Middleware()
    })

    ioc.bind('Adonis/Middleware/Acl', () => {
      return new Middleware()
    })

    Gql.registerNamed({
      auth: 'Adonis/Middleware/Auth',
      acl: 'Adonis/Middleware/Acl'
    })

    class UserMiddlewareController {
      user (parent, args, ctx) {}
      users (parent, args, ctx) {}

      static middlewares () {
        return {
          all: ['auth'],
          users: ['acl']
        }
      }
    }

    ioc.bind('App/Controllers/Gql/UserMiddlewareController', () => {
      return UserMiddlewareController
    })

    Gql.schema('UserMiddleware', () => {
      Gql.query('UserMiddlewareController')
    })

    Gql.register()

    const authBound = Gql.$middleware[0].Query.user

    const aclBound = Gql.$middleware[1].Query.users

    assert.deepEqual(Gql.$middleware, [
      {
        Query: {
          user: authBound,
          users: authBound
        }
      },
      { Query: { users: aclBound } }
    ])
  })

  test('middleware registered when schema is defined', assert => {
    const Gql = ioc.use('Gql')

    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {}
    }

    ioc.bind('Adonis/Middleware/Auth', () => {
      return new Middleware()
    })

    ioc.bind('Adonis/Middleware/Acl', () => {
      return new Middleware()
    })

    Gql.registerNamed({
      auth: 'Adonis/Middleware/Auth',
      acl: 'Adonis/Middleware/Acl'
    })

    Gql.schema('Unamed', () => {
      Gql.query('Queries/UnamedController')
      Gql.mutation('Mutations/UnamedController')
    }).middleware(['auth', 'acl'])

    Gql.register()

    const authBoundQuery = Gql.$middleware[0].Query.name
    const aclBoundQuery = Gql.$middleware[1].Query.name
    const authBoundMutation = Gql.$middleware[2].Mutation.addName
    const aclBoundMutation = Gql.$middleware[3].Mutation.addName

    assert.deepEqual(Gql.$middleware, [
      { Query: { name: authBoundQuery } },
      { Query: { name: aclBoundQuery } },
      { Mutation: { addName: authBoundMutation } },
      { Mutation: { addName: aclBoundMutation } }
    ])
  })

  test('middleware registered when resolver is defined', assert => {
    const Gql = ioc.use('Gql')

    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {}
    }

    ioc.bind('Adonis/Middleware/Auth', () => {
      return new Middleware()
    })

    ioc.bind('Adonis/Middleware/Acl', () => {
      return new Middleware()
    })

    Gql.registerNamed({
      auth: 'Adonis/Middleware/Auth',
      acl: 'Adonis/Middleware/Acl'
    })

    Gql.schema('Unamed', () => {
      Gql.query('Queries/UnamedController').middleware(['auth'])
      Gql.mutation('Mutations/UnamedController').middleware(['acl'])
    })

    Gql.register()

    const authBound = Gql.$middleware[0].Query.name
    const aclBound = Gql.$middleware[1].Mutation.addName

    assert.deepEqual(Gql.$middleware, [
      { Query: { name: authBound } },
      { Mutation: { addName: aclBound } }
    ])
  })

  test('middleware registered when schema and resolver is defined', assert => {
    const Gql = ioc.use('Gql')

    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {}
    }

    ioc.bind('Adonis/Middleware/Auth', () => {
      return new Middleware()
    })

    ioc.bind('Adonis/Middleware/Acl', () => {
      return new Middleware()
    })

    Gql.registerNamed({
      auth: 'Adonis/Middleware/Auth',
      acl: 'Adonis/Middleware/Acl'
    })

    Gql.schema('Unamed', () => {
      Gql.query('Queries/UnamedController').middleware(['auth'])
      Gql.mutation('Mutations/UnamedController')
    }).middleware(['acl'])

    Gql.register()

    const authBoundQuery = Gql.$middleware[0].Query.name
    const aclBoundQuery = Gql.$middleware[1].Query.name
    const aclBoundMutation = Gql.$middleware[2].Mutation.addName

    assert.deepEqual(Gql.$middleware, [
      { Query: { name: authBoundQuery } },
      { Query: { name: aclBoundQuery } },
      { Mutation: { addName: aclBoundMutation } }
    ])
  })

  test('middleware registered when schema and resolver is defined and inside controller', assert => {
    const Gql = ioc.use('Gql')

    class Middleware {
      async gqlHandle (resolve, root, args, context, info) {}
    }

    ioc.bind('Adonis/Middleware/Auth', () => {
      return new Middleware()
    })

    ioc.bind('Adonis/Middleware/Acl', () => {
      return new Middleware()
    })

    ioc.bind('Adonis/Middleware/SaaS', () => {
      return new Middleware()
    })

    Gql.registerNamed({
      auth: 'Adonis/Middleware/Auth',
      acl: 'Adonis/Middleware/Acl',
      saas: 'Adonis/Middleware/SaaS'
    })

    class UserMiddlewareController {
      user (parent, args, ctx) {}

      static middlewares () {
        return {
          all: ['auth'],
          user: ['acl']
        }
      }
    }

    ioc.bind('App/Controllers/Gql/UserMiddlewareController', () => {
      return UserMiddlewareController
    })

    Gql.schema('UserMiddleware', () => {
      Gql.query('UserMiddlewareController')
    }).middleware(['saas'])

    Gql.register()

    const saasBound = Gql.$middleware[0].Query.user
    const authBound = Gql.$middleware[1].Query.user
    const aclBound = Gql.$middleware[2].Query.user

    assert.deepEqual(Gql.$middleware, [
      { Query: { user: saasBound } },
      { Query: { user: authBound } },
      { Query: { user: aclBound } }
    ])
  })
})
