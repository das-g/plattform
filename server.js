const { makeExecutableSchema } = require('graphql-tools')
const { server } = require('@orbiting/backend-modules-base')
const { merge } = require('apollo-modules-node')
const t = require('./lib/t')

const { graphql: documents } = require('@orbiting/backend-modules-documents')

module.exports.run = () => {
  const localModule = require('./graphql')
  const executableSchema = makeExecutableSchema(merge(localModule, [documents]))

  // middlewares
  const middlewares = []

  return server.run(executableSchema, middlewares, t)
}

module.exports.close = () => {
  server.close()
}
