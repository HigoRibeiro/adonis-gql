'use strict'

const test = require('japa')
const { setupResolver } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')
const { mergeResolvers, mergeTypes } = require('merge-graphql-schemas')

const mock = require('mock-fs')

const Resolver = require('../../src/Resolver')
const Schema = require('../../src/Resolver/Schema')
const Manager = require('../../src/Resolver/Manager')

test.group('Resolver', group => {
  group.beforeEach(() => {
    ioc.restore()
  })

  group.before(() => {
    setupResolver()
  })

  test('bind resolver controller when a string is passed', assert => {
    class PostController {
      posts (parent, args, ctx) {}
      $private (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })

    const resolver = new Resolver('Post', 'PostController')
    const resolvers = resolver.transform().Query

    assert.property(resolvers, 'posts')
    assert.notProperty(resolvers, '$private')
  })

  test('execute private method inside query method', assert => {
    class PostController {
      posts (parent, args, ctx) {
        return this.$private()
      }
      $private (parent, args, ctx) {
        return 'test'
      }
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })

    const resolver = new Resolver('Post', 'PostController')
    const { posts } = resolver.transform().Query
    assert.equal('test', posts())
  })

  test('execute resolver from controller', assert => {
    class PostController {
      posts (parent, args, ctx) {
        return 'test'
      }
      $private (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })

    const resolver = new Resolver('Post', 'PostController')
    const { posts } = resolver.transform().Query
    assert.equal('test', posts())
  })

  test('merge two controller bound', assert => {
    class PostController {
      posts (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })

    class UserController {
      users (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/UserController', () => {
      return UserController
    })

    const resolver = new Resolver('Post', 'PostController')
    const PostQuery = resolver.transform()

    const resolver2 = new Resolver('User', 'UserController')
    const UserQuery = resolver2.transform()

    const { Query } = mergeResolvers([PostQuery, UserQuery])
    assert.property(Query, 'posts')
    assert.property(Query, 'users')
  })
})

test.group('Manager | Schema', group => {
  group.beforeEach(() => {
    ioc.restore()
    mock({
      'App/Schemas/Post.graphql': 'type Query { title: String }',
      'App/Schemas/User.graphql':
        'type Mutation { addUser(name: String!): String }'
    })
  })

  group.afterEach(() => {
    Manager.clear()
    mock.restore()
  })

  test('add a new schema', assert => {
    Manager.schema('Post')
    assert.instanceOf(Manager.schemas[0], Schema)
    assert.equal('type Query { title: String }', Manager.schemas[0].transform())
  })

  test('add schema with callback to resolvers', assert => {
    ioc.bind('App/Schemas/Post', () => {
      return `type Query { title: String }`
    })

    class PostController {
      posts (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })

    Manager.schema('Post', () => {
      Manager.query('PostController')
      Manager.mutation('PostController')
    })

    assert.instanceOf(Manager.schemas[0], Schema)
    assert.equal('type Query { title: String }', Manager.schemas[0].transform())
    assert.instanceOf(Manager.resolvers.get('Post:Query'), Resolver)

    assert.equal(Manager.resolvers.get('Post:Query').name, 'Post:Query')
  })

  test('merge differents schemas', assert => {
    Manager.schema('Post')
    Manager.schema('User')

    const postSchema = Manager.schemas[0].transform()
    const userSchema = Manager.schemas[1].transform()

    const schema = mergeTypes([postSchema, userSchema]).toString()
    assert.equal(
      schema,
      `schema {
  query: Query
  mutation: Mutation
}

type Query {
  title: String
}

type Mutation {
  addUser(name: String!): String
}
`
    )
  })
})

test.group('Manager | Resolver', group => {
  group.beforeEach(() => {
    ioc.restore()
  })

  group.afterEach(() => {
    Manager.clear()
  })

  test('add a new query resolver', assert => {
    class UserController {
      users (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/UserController', () => {
      return UserController
    })

    Manager.query('User', 'UserController')
    assert.instanceOf(Manager.resolvers.get('User:Query'), Resolver)
    assert.equal(Manager.resolvers.get('User:Query').name, 'User:Query')
  })

  test('add a new mutation resolver', assert => {
    class UserController {
      addUser (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/UserController', () => {
      return UserController
    })

    Manager.mutation('User', 'UserController')
    assert.instanceOf(Manager.resolvers.get('User:Mutation'), Resolver)
    assert.equal(Manager.resolvers.get('User:Mutation').name, 'User:Mutation')
  })

  test('add a new specific type resolver', assert => {
    class UserController {
      posts (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/UserController', () => {
      return UserController
    })

    Manager.query('User', 'UserController', 'User')
    assert.instanceOf(Manager.resolvers.get('User:User'), Resolver)
    assert.equal(Manager.resolvers.get('User:User').name, 'User:User')
  })

  test('merge diferent resolvers', assert => {
    class UnamedController {
      method (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/UnamedController', () => {
      return UnamedController
    })

    Manager.query('User', 'UnamedController')
    Manager.mutation('User', 'UnamedController')
    Manager.query('User', 'UnamedController', 'User')

    const userQueryController = Manager.resolvers.get('User:Query')
    const userMutationController = Manager.resolvers.get('User:Mutation')
    const userUserController = Manager.resolvers.get('User:User')

    const UserQuery = userQueryController.transform()
    const UserMutation = userMutationController.transform()
    const UserUser = userUserController.transform()

    const resolvers = mergeResolvers([UserQuery, UserMutation, UserUser])

    assert.property(resolvers, 'Query')
    assert.property(resolvers, 'Mutation')
    assert.property(resolvers, 'User')

    assert.property(resolvers.Query, 'method')
    assert.property(resolvers.Mutation, 'method')
    assert.property(resolvers.User, 'method')
  })
})
