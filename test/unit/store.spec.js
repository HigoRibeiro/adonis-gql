'use strict'

const test = require('japa')
const { setupResolver } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')

const Store = require('../../src/Resolver/Store')

test.group('Store', group => {
  group.before(() => {
    setupResolver()

    class PostController {
      posts (parent, args, ctx) {}
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })
  })

  test('add resolver', assert => {
    Store.resolver('Post', 'PostController')
  })
})
