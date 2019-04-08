'use strict'

const Gql = use('Gql')

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| Global middleware are executed on each Resolver.
|
*/
const globalMiddleware = []

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key/value pairs. Later you can use the
| keys to run selected middleware on a given resolver.
|
| // define
| {
|   auth: 'Adonis/Middleware/Auth'
| }
*/
const namedMiddleware = {}

Gql.registerGlobal(globalMiddleware)
  .registerNamed(namedMiddleware)
  .register()
