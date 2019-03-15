'use strict'

const url = require('url')
const { makeExecutableSchema } = require('graphql-tools')

module.exports = {
  getRequest (req) {
    return {
      request: req,
      method () {
        return this.request.method
      },
      post () {
        return this.request.body
      },
      get () {
        const query = url.parse(this.request.url, true).query
        return query
      }
    }
  },
  getResponse (req, res) {
    return {
      cache: null,
      request: req,
      response: res,
      status (code) {
        res.statusCode = code
        return this
      },
      type (type = 'text/plain', code = 200) {
        res.writeHead(code, { 'Content-Type': type })
      },
      json (response) {
        try {
          const parsedData = JSON.parse(response)
          this.cache = parsedData
          this.send(parsedData)
        } catch (e) {}
      },
      on (name, listener) {
        res.on(name, listener)
      },
      send (message) {
        res.write(message)
        res.end()
      },
      header (name, value) {
        this.response.setHeader(name, value)
      }
    }
  },
  getTypeDef () {
    return `
    type User {
      id: Int
      username: String
      email: String
      password: String
      posts: [Post]
    }
  
    type Post {
      id: Int
      title: String
      content: String
      author: User
    }
  
    type Query {
      posts: [Post]
    }
  `
  },
  getSchema () {
    return makeExecutableSchema({ typeDefs: this.getTypeDef() })
  }
}
