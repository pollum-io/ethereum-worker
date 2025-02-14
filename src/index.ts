import 'dotenv/config'
import 'express-async-errors'
import express, { NextFunction, json, Request, Response } from 'express'
import cors from 'cors'
import logger from './utils/logger'
import helmet from 'helmet'
import { cacheHandler, updateCache } from './handlers/cache'
import filterBlacklist from './middlewares/contractBlackList'
import wsMiddleware from './handlers/ws'
import health from './handlers/health'
import metricsMiddleware from './middlewares/metrics'
import { getCurrentMetrics, getMetrics } from './handlers/metrics'
import auth from './middlewares/auth'
import { addToBlacklist, removeFromBlacklist } from './handlers/blacklist'
import limiter from './middlewares/limiter'
import { createKey } from './handlers/apiGateway'

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

app.use(limiter)
app.get('/utils/summary', auth, getMetrics)
app.get('/utils/metrics', auth, getCurrentMetrics)
app.put('/utils/updatecache', auth, updateCache)
app.post('/utils/createkey', auth, createKey)

app.put('/utils/blacklist', auth, addToBlacklist)
app.delete('/utils/blacklist', auth, removeFromBlacklist)

app.use('/wss', wsMiddleware)
app.post('/', metricsMiddleware, filterBlacklist, cacheHandler)

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
