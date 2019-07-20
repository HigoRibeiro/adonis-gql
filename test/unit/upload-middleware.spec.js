'use strict'

const test = require('japa')
const UploadMiddleware = require('../../src/Middleware/Upload')
const { getRequestWithMultipart } = require('./helpers')

test.group('Upload middleware', async () => {
  test('nothing happens when multipart is not defined', async assert => {
    const stacks = []

    const uploadMiddleware = new UploadMiddleware()
    await uploadMiddleware.handle({ request: {} }, async () => {
      stacks.push('only next')
    })

    assert.deepEqual(stacks, ['only next'])
  })

  test('should pass the single file to the graphql variables', async assert => {
    const request = getRequestWithMultipart()

    request.multipart.setFields([
      ['operations', '{ "query" : "fake", "variables": { "file": null } }'],
      ['map', '{ "0": ["variables.file"] }']
    ])

    request.multipart.setFiles([
      ['0', {
        stream: 'stream',
        fieldName: '0',
        toJSON () {
          return {
            name: 'file.txt'
          }
        }
      }]
    ])

    const uploadMiddleware = new UploadMiddleware()
    await uploadMiddleware.handle({ request }, async () => { })

    assert.deepEqual(await request.body.variables.file, { name: 'file.txt', stream: 'stream' })

    assert.typeOf(request.body.variables.file, 'Promise')
    assert.include(request.body, { query: 'fake' })
  })

  test('should pass the multiple files to the graphql variables', async assert => {
    const request = getRequestWithMultipart()

    request.multipart.setFields([
      ['operations', '{ "query" : "fake", "variables": { "files": [null, null] } }'],
      ['map', '{ "0": ["variables.files.0"], "1": ["variables.files.1"] }']
    ])

    request.multipart.setFiles([
      ['0', {
        stream: 'stream',
        fieldName: '0',
        toJSON () {
          return {
            name: 'file1.txt'
          }
        }
      }],
      ['1', {
        stream: 'stream',
        fieldName: '1',
        toJSON () {
          return {
            name: 'file2.txt'
          }
        }
      }]
    ])

    const uploadMiddleware = new UploadMiddleware()
    await uploadMiddleware.handle({ request }, async () => { })

    assert.deepEqual(await request.body.variables.files[0], { name: 'file1.txt', stream: 'stream' })
    assert.deepEqual(await request.body.variables.files[1], { name: 'file2.txt', stream: 'stream' })

    assert.typeOf(request.body.variables.files[0], 'Promise')
    assert.typeOf(request.body.variables.files[1], 'Promise')
    assert.include(request.body, { query: 'fake' })
  })

  test('should throw an exception when the operation is invalid', async assert => {
    const request = getRequestWithMultipart()

    request.multipart.setFields([
      ['operations', '{ "query" : "fake" } "variables": { "file": null } }'],
      ['map', '{ "0": ["variables.file"] }']
    ])

    const uploadMiddleware = new UploadMiddleware()
    try {
      await uploadMiddleware.handle({ request }, async () => { })
    } catch (err) {
      assert.equal(err.message, `Invalid JSON in the 'operations' multipart field`)
    }
  })

  test('should throw an exception when the map is invalid', async assert => {
    const request = getRequestWithMultipart()

    request.multipart.setFields([
      ['operations', '{ "query" : "fake", "variables": { "file": null } }'],
      ['map', '{ "0" ["variables.file"] }']
    ])

    const uploadMiddleware = new UploadMiddleware()
    try {
      await uploadMiddleware.handle({ request }, async () => { })
    } catch (err) {
      assert.equal(err.message, `Invalid JSON in the 'map' multipart field`)
    }
  })

  test('should throw an exception when the file is invalid', async assert => {
    const request = getRequestWithMultipart()

    request.multipart.setFields([
      ['operations', '{ "query" : "fake", "variables": { "file": null } }'],
      ['map', '{ "0": ["variables.file"] }']
    ])

    request.multipart.setFiles([
      ['1', {
        stream: 'stream',
        fieldName: '1',
        toJSON () {
          return {
            name: 'file.txt'
          }
        }
      }]
    ])

    const uploadMiddleware = new UploadMiddleware()
    try {
      await uploadMiddleware.handle({ request }, async () => { })
    } catch (err) {
      assert.equal(err.message, `File not found`)
    }
  })
})
