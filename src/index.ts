import 'dotenv/config'
import express, {
  json,
  Response as EResponse,
  Request as ERequest,
  response,
} from 'express'
import cors from 'cors'
import log from 'pino-http'
import { handleRequest } from './handlers/handler'
import logger from './utils/logger'

const app = express()
//app.use(log())
app.use(cors())
app.use(json())

app.post('/', async (req: ERequest, res: EResponse) => {
  const response = await handleRequest(req)
  for (const [key, value] of response.headers) {
    res.setHeader(key, value)
  }

  return res.json(await response.json())
})

app.post('/test', async (req, res) => {
  return res.json()
})

//app.use(function(_req, res) {
//  const redirectLocation = 'https://syscoin.org/about'
//
//  res.status(301)
//
//  res.redirect(redirectLocation)
//})

app.listen(3333, () => {
  const time = new Date()
  console.log(`[${time.toISOString()}]: Server started on port 3333!`)
})
