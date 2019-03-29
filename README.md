# Adonis GraphQL Provider

A [GraphQL](https://graphql.org) provider for the Adonis framework

This library provides an easy way to start using GraphQL with AdonisJS without losing the essence of it.

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
  /* Register preLoads to GrafQLProvider */
  .preLoad('start/graphql.js')
  .preLoad('start/gqlKernel.js')
  /* End */

  .fireHttpServer()
  .catch(console.error);
```

## Usage

To use `adonis-gql` you need to set `Controllers` and `Schemas` and configure them in the `start/graphql.js` file.

### Resolvers

The resolvers are in the directory `app/Controllers/Gql`.

Here the ** resolvers ** are separated by `Queries`, `Mutations` or a specific type.
The file for `Queries` of `Post` staying in `app/Controllers/Gql/Queries/PostController.js`:

```js
class PostController {
  async posts(parent, arg, ctx) {}
}

module.exports = PostController;
```

The file for `Mutations` of `Post` staying in `app/Controllers/Gql/Mutations/PostController.js`:

```js
class PostController {
  async addPost(parent, arg, ctx) {}
}

module.exports = PostController;
```

For the sake of organization, adonis-gql create directories to separate the types `app/Controllers/Gql/Queries` and `app/Controllers/Gql/Mutations`.

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

### Registering the resolvers and schemas

For effective use of `resolvers` and `schemas` it is necessary to register them in `start/graphql.js`:

```js
const Gql = use('Gql');

// Here it has to be exactly that of the file defined in app/Schemas
Gql.schema('Post');

Gql.query('Post', 'Queries/PostController');
Gql.mutation('Post', 'Mutations/PostController');

// Maybe you prefer to organize more.

Gql.schema('Post', () => {
  Gql.query('Queries/PostController');
  Gql.mutation('Mutations/PostController');
});
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

| Command                      | Description                    | Options                                                                                                                                                                |
| ---------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adonis gql:schema <name>`   | Make a new schema to graphql   | `-r` Generate resolvers query and mutation for the schema<br> `-q` Generate only query resolver for the schema<br> `-m` Generate only mutation resolver for the schema |
| `adonis gql:resolver <name>` | Make a new resolver to graphql | `-q` Generate only query resolver for the schema<br> `-m` Generate only mutation resolver for the schema                                                               |

## Thanks

Thank you very much to the creators of [AdonisJS](https://adonisjs.com/) for creating this wonderful framework.
