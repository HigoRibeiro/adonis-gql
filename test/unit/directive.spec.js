'use strict'

const test = require('japa')
const { setupResolver } = require('@adonisjs/sink')
const { ioc } = require('@adonisjs/fold')

const Directive = require('../../src/Directive')
const DirectiveManager = require('../../src/Directive/Manager')

const Resolver = require('../../src/Resolver')

test.group('Directive', group => {
  group.beforeEach(() => {
    ioc.restore()
  })

  group.before(() => {
    setupResolver()
  })

  test('add a new directive', assert => {
    class DeprecatedDirective { }

    ioc.bind('App/Directives/DeprecatedDirective', () => {
      return DeprecatedDirective
    })

    DirectiveManager.directive('deprecated', 'DeprecatedDirective')

    assert.instanceOf(DirectiveManager.directives.get('deprecated'), Directive)
  })

  test('execute directive', assert => {
    class DeprecatedDirective { }

    ioc.bind('App/Directives/DeprecatedDirective', () => {
      return DeprecatedDirective
    })

    const directive = new Directive('deprecated', 'DeprecatedDirective')
    assert.equal(directive.transform(), DeprecatedDirective)
  })

  test('execute resolver from controller', assert => {
    class PostController {
      posts (parent, args, ctx) {
        return 'test'
      }
      $private (parent, args, ctx) { }
    }

    ioc.bind('App/Controllers/Gql/PostController', () => {
      return PostController
    })

    const resolver = new Resolver('Post', 'PostController')
    const { posts } = resolver.transform().Query
    assert.equal('test', posts())
  })

  test('clear directives', assert => {
    class DeprecatedDirective { }

    ioc.bind('App/Directives/DeprecatedDirective', () => {
      return DeprecatedDirective
    })

    DirectiveManager.directive('deprecated', 'DeprecatedDirective')
    DirectiveManager.clear()

    assert.isEmpty(DirectiveManager.directives)
  })
})
