import { Request, Response } from 'express'
import { httpConfig, cacheConfig } from '../config'
import { URL } from 'url'
import { HttpClient } from '../lib/httpClient'
import { AxiosResponse } from 'axios'

export async function cacheHandler(req: Request, res: Response) {
  const url = new URL(httpConfig.originUrl)

  const httpClient = new HttpClient(
    url,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      keepalive: true,
    },
    cacheConfig.cache,
  )

  let response: AxiosResponse | undefined

  if (Array.isArray(req.body)) {
    response = await httpClient.forwardWithoutCache('', req.body)
  } else {
    if (!req.body?.method) {
      let responseBody = {
        id: 1,
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `The method ${req.body?.method} does not exist/is not available`,
        },
      }
      return res.status(400).json(responseBody)
    } else if (!cacheConfig.cacheableMethods.includes(req.body.method)) {
      response = await httpClient.forwardWithoutCache('', req.body)
    } else {
      response = await httpClient.fetchWeb3(
        '',
        req.body,
        cacheConfig.cacheTtl,
        cacheConfig.staleTtl,
      )
    }
  }

  for (const [key, value] of Object.entries(response.headers)) {
    res.setHeader(key, value)
  }

  return res.status(response.status).json(response.data)
}
