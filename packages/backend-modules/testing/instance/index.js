const path = require('path')
const PG = require('./PG')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const buildClients = require('./buildClients')
const { getId } = require('./pool')

// this utility launches a server for testing
// the port, PG and redis instances are uniquely available to the instance.
// there can be multiple instance processes running simultaniously
// but there can only be one instance started in one process (because process.env is global)
//
// REDIS_URL: if set is has to be a base url, allowing to append '/db'
//
const init = async ({ publicationScheduler, searchNotifyListener = null }) => {
  // checks
  if (global.instance) {
    throw new Error('only one instance per process')
  }
  global.instance = 'init'

  // load env of server
  require('@orbiting/backend-modules-env').config('.test.env')

  const instanceId = await getId()

  const port = 5010 + instanceId

  // create PG DB
  const dbName = `test${instanceId}`
  const db = await PG.createAndMigrate(dbName)
  if (!db) {
    throw new Error('PG db creating failed')
  }

  const redisUrl = `${
    process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  }/${instanceId}`

  const esPrefix = `test${instanceId}`

  console.log({ instanceId, redisUrl, port, databaseUrl: db.url, esPrefix })

  process.env.PORT = port
  process.env.DATABASE_URL = db.url
  process.env.REDIS_URL = redisUrl
  process.env.ES_INDEX_PREFIX = esPrefix
  process.env.SEND_MAILS_LOG = false
  process.env.SEND_MAILS = false
  process.env.SEND_NOTIFICATIONS = false
  process.env.SLACK_API_TOKEN = ''
  if (publicationScheduler) {
    process.env.PUBLICATION_SCHEDULER = true
  }
  if (searchNotifyListener !== null && !searchNotifyListener) {
    process.env.SEARCH_PG_LISTENER = false
  }

  // flush redis
  const redis = Redis.connect()
  await redis.flushdbAsync()
  Redis.disconnect(redis)

  // create ES indices
  const pullElasticsearch = require('@orbiting/backend-modules-search/lib/pullElasticsearch')
  const dropElasticsearch = require('@orbiting/backend-modules-search/lib/dropElasticsearch')
  await dropElasticsearch(esPrefix, { debug: false })
  await pullElasticsearch({
    inserts: false,
    ensurePropagation: false,
    debug: false,
  })

  // require server's server.js and start
  const Server = require('@orbiting/api-app/server')
  const server = await Server.start()

  const closeAndCleanup = async () => {
    const { pgdb } = global.instance.context
    expect(await PG.hasOpenTransactions(pgdb, dbName)).toBeFalsy()
    await server.close()
    await db.drop()
    // drop ES indices
    await dropElasticsearch(esPrefix, { debug: false })
    global.instance = null
  }

  global.instance = {
    server,
    closeAndCleanup,
    apolloFetch: buildClients(port).createApolloFetch(),
    createApolloFetch: () => buildClients(port).createApolloFetch(),
    clients: buildClients(port),
    context: server.createGraphqlContext({}),
  }

  console.log('init completed')
}

const bootstrapEnv = () => {
  if (!process.env.DEFAULT_MAIL_FROM_ADDRESS) {
    process.env.DEFAULT_MAIL_FROM_ADDRESS = 'test@test.republik.ch'
  }
  if (!process.env.DEFAULT_MAIL_FROM_NAME) {
    process.env.DEFAULT_MAIL_FROM_NAME = 'Test'
  }
  if (!process.env.ASSETS_SERVER_BASE_URL) {
    process.env.ASSETS_SERVER_BASE_URL = 'http://localhost:5020'
  }
  if (!process.env.FRONTEND_BASE_URL) {
    process.env.FRONTEND_BASE_URL = 'http://localhost:3000'
  }
}

module.exports = {
  init: async (args) => {
    try {
      await init(args)
    } catch (e) {
      console.error(e)
    }
  },
  bootstrapEnv,
}
