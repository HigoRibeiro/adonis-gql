const objectPath = require('object-path')
const Upload = require('./utils')

class UploadMiddleware {
  async handle ({ request }, next) {
    if (request.multipart) {
      let operations
      let operationsPath
      let map

      request.multipart.field((name, value) => {
        switch (name) {
          case 'operations':
            try {
              operations = JSON.parse(value)
            } catch (err) {
              throw new Error(`Invalid JSON in the 'operations' multipart field`)
            }

            operationsPath = objectPath(operations)
            break
          case 'map':
            let parsedMap
            try {
              parsedMap = JSON.parse(value)
            } catch (err) {
              throw new Error(`Invalid JSON in the 'map' multipart field`)
            }

            const mapEntries = Object.entries(parsedMap)

            map = new Map()
            for (const [fieldName, paths] of mapEntries) {
              map.set(fieldName, new Upload())

              for (const [, path] of paths.entries()) {
                operationsPath.set(path, map.get(fieldName).promise)
              }
            }
        }
      })

      request.multipart.file('*', {}, async (file) => {
        const upload = map.get(file.fieldName)

        if (!upload) {
          throw new Error('File not found')
        }

        upload.resolve({
          ...file.toJSON(),
          stream: file.stream
        })
      })

      await request.multipart.process()

      request.updateBody(operations)
    }

    await next()
  }
}

module.exports = UploadMiddleware
