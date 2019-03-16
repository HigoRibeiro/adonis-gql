'use strict'

const path = require('path')

async function copyFile (cli, file) {
  const inFile = path.join(__dirname, 'config', file)
  const outFile = path.join(cli.helpers.appRoot(), `start/${file}`)
  await cli.copy(inFile, outFile)
  cli.command.completed('create', `start/${file}`)
}

module.exports = async cli => {
  try {
    await copyFile(cli, 'graphql.js')
    await copyFile(cli, 'gqlKernel.js')
  } catch (error) {
    // ignore error
  }
}
