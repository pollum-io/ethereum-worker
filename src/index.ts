import 'dotenv/config'
import 'express-async-errors'
import express, { NextFunction, json, Request, Response } from 'express'
import cors from 'cors'
import logger from './utils/logger'
import helmet from 'helmet'
import { cacheHandler, cacheStatus } from './handlers/cache'
import filterBlacklist from './middlewares/contractBlackList'
import wsMiddleware from './handlers/ws'
import health from './handlers/health'

const app = express()
app.use(cors())
app.use(helmet())
app.use(json())

app.use(function(req, _res, next) {
  logger.info(
    JSON.stringify({
      method: req.method.toUpperCase(),
      path: req.path,
      host: req.headers['host'],
      origin: req.headers.origin,
      ip: req.ip,
      location: req.headers.location,
    }),
  )
  next()
})

app.get('/utils/health', health)
app.get('/utils/cachestatus', cacheStatus)
app.use('/wss', wsMiddleware)
app.post('/', filterBlacklist, cacheHandler)

app.use(function(_req, res) {
  const redirectLocation = 'https://syscoin.org/about'

  res.status(301)

  res.redirect(redirectLocation)
})

app.use((err: Error, request: Request, response: Response, _: NextFunction) => {
  logger.error(err)

  return response.status(500).json({
    id: 1,
    jsonrpc: '2.0',
    error: {
      code: -32601,
      message: `Internal server error`,
    },
  })
})

const server = app.listen(3333, () => {
  logger.info('Server started on port 3333!')
})

server.on('upgrade', wsMiddleware.upgrade)
