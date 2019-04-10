# Adonis GraphQL Provider

A [GraphQL](https://graphql.org) provider for the Adonis framework

This library provides an easy way to start using GraphQL with AdonisJS without losing the essence of it.


If you like it, consider [![Buy me a coffee](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://www.buymeacoffee.com/higoribeiro)

## Install

`adonis install adonis-gql`

In the installation the `start/graphql.js` and `start/gqlKernel.js` files will be created.

## Configure

Register the provider in `start/app.js`:

```js
const providers = [
  // ...
  'adonis-gql/providers/GQLProvider'
];
```

Record the `preLoads` needed in `server.js`:

```js
new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  /* Register preLoads to GQLProvider */
  .preLoad('start/graphql.js')
  .preLoad('start/gqlKernel.js')
  /* End */

  .fireHttpServer()
  .catch(console.error)
```

## Usage

To use `adonis-gql` you need to set `Controllers` and `Schemas` and configure them in the `start/graphql.js` file.

### Middlewares

You can add `middlewares` to your **resolvers**, they can be global or named, so you need to create a middleware that has the `gqlHandle` method and register it.

```js
class Auth {
  async gqlHandle (resolve, root, args, ctx, info) {
    const result = await resolve(parent, args, ctx, info)
    return result
  }
}

module.exports = Auth
```

To use them you need to register them in the `start/gqlKernel.js` file:

```js
// to use global
Gql.registerGlobal(['App/Middleware/Auth'])

// to use named
Gql.registerNamed({
  auth: 'App/Middleware/Auth'
})
```

### Resolvers

The resolvers are in the directory `app/Controllers/Gql`.

Here the **resolvers** are separated by `Queries`, `Mutations` or a specific type.
The file for `Queries` of `Post` staying in `app/Controllers/Gql/Queries/PostController.js`:

```js
class PostController {
  async posts(parent, arg, ctx) {}
}

module.exports = PostController
```

The file for `Mutations` of `Post` staying in `app/Controllers/Gql/Mutations/PostController.js`:

```js
class PostController {
  async addPost(parent, arg, ctx) {}
}

module.exports = PostController
```

For the sake of organization, adonis-gql create directories to separate the types `app/Controllers/Gql/Queries` and `app/Controllers/Gql/Mutations`.

#### Middlewares

You can add middlewares inside the **Controller** class with the `static` method called `middlewares` and it needs to return an object containing the keys with the previously registered middlewares:

```js
class PostController {
  async posts(parent, arg, ctx) {}

  static middlewares () {
    return {
      posts: ['auth']
    }
  }
}

module.exports = PostController
```


Note that to add a middleware to all methods of the class use the keyword `all`:
```js
static middlewares () {
  return {
    all: ['auth']
  }
}
```

### Schema

The schemas are in the directory
`app/Schemas`.

The `schema` file should have the type name (a suggestion, not an obligation) and always end with the extension `.graphql`.

Following the example above, the file for the `schema` of `Post` staying in `app/Schemas/Post.graphql`:

```graphql
type Query {
  posts: [Post]
}

type Mutation {
  addPost(title: String!, content: String!): Post
}

type Post {
  id: Id
  title: String
  content: String
}
```

### Directive

The directives are in the directory `app/Directives`. The file for `Deprecated` directive staying in `app/Directives/DeprecatedDirective.js`:

```js
'use strict'

const SchemaDirectiveVisitor = use('SchemaDirectiveVisitor')

class Deprecated extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    field.isDeprecated = true;
    field.deprecationReason = this.args.reason
  }

  visitEnumValue(value) {
    value.isDeprecated = true;
    value.deprecationReason = this.args.reason
  }
}

module.exports = Deprecated
```

The example was taken from [Implementing schema directives](https://www.apollographql.com/docs/graphql-tools/schema-directives#implementing-schema-directives).

```
/!\
Always a directive will be extended SchemaDirectiveVisitor /!\
```

### Registering the resolvers and schemas

For effective use of `resolvers` and `schemas` it is necessary to register them in `start/graphql.js`:

```js
const Gql = use('Gql')

// Here it has to be exactly that of the file defined in app/Schemas
Gql.schema('Post')

Gql.query('Post', 'Queries/PostController')
Gql.mutation('Post', 'Mutations/PostController')

// Maybe you prefer to organize more.

Gql.schema('Post', () => {
  Gql.query('Queries/PostController')
  Gql.mutation('Mutations/PostController')
})
```

You can add middlewares to the schemas and resolvers respectively, note that the middlewares called in the schema will be applied to the resolvers that involves.

```js
Gql.schema('Post', () => {
  Gql.query('Queries/PostController').middleware(['auth'])
  Gql.mutation('Mutations/PostController').middleware(['auth'])
})
```

It's the same as:

```js
Gql.schema('Post', () => {
  Gql.query('Queries/PostController')
  Gql.mutation('Mutations/PostController')
}).middleware(['auth'])
```

### Registering the directive

Following the same train of thought you can add the `directive` in AdonisGql. The first argument is its name and the second its controller, register them in `start/graphql.js`:

```js
const Gql = use('Gql')

Gql.directive('deprecated', 'DeprecatedDirective')
```


### Routes

Finally, it is necessary to configure the `handle` do `adonis-gql` in the route that you want.

In the file `start/routes.js`:

```js
// ...
const Gql = use('Gql')

Route.post('/', ctx => Gql.handle(ctx))
// If you want a playground
Route.get('/graphiql', ctx => Gql.handleUi(ctx))
```

## Commands

| Command                       | Description                     | Options                                                                                                                                                                |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adonis gql:schema <name>`    | Make a new schema to graphql    | `-r` Generate resolvers query and mutation for the schema<br> `-q` Generate only query resolver for the schema<br> `-m` Generate only mutation resolver for the schema |
| `adonis gql:resolver <name>`  | Make a new resolver to graphql  | `-q` Generate only query resolver for the schema<br> `-m` Generate only mutation resolver for the schema                                                               |
| `adonis gql:directive <name>` | Make a new directive to graphql |                                                                                                                                                                        |
| `adonis gql:middleware <name>` | Make a new middleware to graphql |                                                                                                                                                                        |

## Thanks

Thank you very much to the creators of [AdonisJS](https://adonisjs.com/) for creating this wonderful framework.

I ♥️ [Rocketseat](https://rocketseat.com.br)
