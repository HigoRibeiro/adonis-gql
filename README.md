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
  "adonis-gql/providers/GQLProvider"
];
```

Record the `preLoads` needed in `server.js`:

```js
new Ignitor(require("@adonisjs/fold"))
  .appRoot(__dirname)
  /* Register preLoads to GrafQLProvider */
  .preLoad("start/graphql.js")
  .preLoad("start/gqlKernel.js")
  /* End */

  .fireHttpServer()
  .catch(console.error);
```

## Usage

To use `adonis-gql` you need to set `Controllers` and `Schemas` and configure them in the `start/graphql.js` file.

### Resolvers

The resolvers are in the directory `app/Controllers/Gql`.

Here the ** resolvers ** are separated by `Query`,`Mutation` or a specific type.
The file for `Query` of `Post` staying in `app/Controllers/Gql/PostQueryController.js`:

```js
class PostQueryController {
  async posts(parent, arg, ctx) {}
}

module.exports = PostQueryController;
```

The file `Mutation` of `Post` staying in `app/Controllers/Gql/PostMutationController.js`:

```js
class PostMutationController {
  async addPost(parent, arg, ctx) {}
}

module.exports = PostMutationController;
```

For the sake of organization, you can create a directory to separate the types `app/Controllers/Gql/Queries` an `app/Controllers/Gql/Mutations`.

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

For effective use of `resolvers` and `schemas` it is necessary to register them in `graphql.js`:

```js
const Gql = use("Gql");

// Here it has to be exactly that of the file defined in app/Schemas
Gql.schema("Post");

Gql.query("Post", "PostQueryController");
Gql.mutation("Post", "PostMutationController");

// Maybe you prefer to organize more.

Gql.schema("Post", () => {
  Gql.query("PostQueryController");
  Gql.mutation("PostMutationController");
});
```

### Routes

Finally, it is necessary to configure the `handle` do `adonis-gql` in the route that you want.

In the file `start/routes.js`:

```js
// ...
const Gql = use("Gql");

Route.post("/", ctx => Gql.handle(ctx));
// If you want a playground
Route.get("/graphiql", ctx => Gql.handle(ctx));
```

## Thanks

Thank you very much to the creators of [AdonisJS](https://adonisjs.com/) for creating this wonderful framework.
