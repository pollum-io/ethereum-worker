import { Request } from 'express'
import { HttpClient } from '../lib/httpClient'
import { httpConfig, cacheConfig } from '../config'
import logger from '../utils/logger'
import { Response, Headers, RequestInit } from 'undici'
import { URL } from 'url'

export async function handleRequest(
  request: Request<any, any, BodyRequest>,
): Promise<Response> {
  const url = new URL(httpConfig.originUrl)

  const headers = new Headers()

  headers.append('content-type', 'application/json;charset=UTF-8')

  const httpClient = new HttpClient(url, <RequestInit>{
    method: 'POST',
    headers: headers,
    keepalive: true,
    cf: {
      cacheEverything: true,
    },
  })

  const body = request.body

  if (Array.isArray(body)) {
    // Call without cache
    const response = await httpClient.forwardWithoutCache('', body)
    return response
  } else {
    if (!body.method) {
      let response = {
        id: body.id,
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `The method ${body.method} does not exist/is not available`,
        },
      }
      return new Response(JSON.stringify(response), { status: 200 })
    } else if (!cacheConfig.cacheableMethods.includes(body.method)) {
      const response = await httpClient.forwardWithoutCache('', body)
      return response
    }
    // Cache for 7 days (604800) and serve stale content for 1 min.
    return httpClient.fetchWeb3('', body, 604800, 60)
  }
}
