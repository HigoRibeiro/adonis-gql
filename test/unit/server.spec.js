'use strict'

const { ioc } = require('@adonisjs/fold')
const test = require('japa')
const mock = require('mock-fs')
const setup = require('../functional/setup')

const Schema = require('../../src/Resolver/Schema')
const Resolver = require('../../src/Resolver')
const Directive = require('../../src/Directive')

test.group('Server', group => {
  group.before(async () => {
    await setup()
  })

  group.beforeEach(() => {
    ioc.restore()
    ioc.use('Gql').clear()
    mock({
      'App/Schemas/Unamed.graphql':
        'type Query { name: String } type Mutation { addName: String }'
    })
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
})
