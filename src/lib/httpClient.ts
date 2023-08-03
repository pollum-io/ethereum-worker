import { httpConfig } from '../config'
import { URL } from 'url'
import NodeCache from 'node-cache'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { BodyRequest, CachedResponse } from '../@types/types'
import logger from '../utils/logger'
const crypto = require('node:crypto').webcrypto

/**
 * HttpClient is a convince wrapper for doing common transforms,
 * such as injecting authentication headers, to fetch requests.
 */
export class HttpClient {
  private readonly url: URL
  private readonly init: RequestInit
  private readonly cache?: NodeCache
  private readonly shortTtl: number = 30
  /**
   * Creates a new HttpClient.
   *
   * @param url required, the base url of all requests.
   * @param init initializer for requests, defaults to empty.
   * @param cache cache storage for requests, defaults to global.
   */
  constructor(
    url: URL,
    init?: RequestInit,
    cache?: NodeCache,
    shortTtl?: number,
  ) {
    if (!url) throw new TypeError('url is a required argument')
    this.url = url

    this.init = init || {}

    this.cache = cache
    this.shortTtl = shortTtl

    if (!this.init.headers) this.init.headers = {}
  }

  public async forwardWithoutCache(
    path: string,
    body: BodyRequest,
    init?: AxiosRequestConfig,
  ): Promise<AxiosResponse> {
    path = new URL(httpConfig.originUrl + path).toString()

    let response = await axios.post(path, body, init)
    return response
  }

  private initMerge(
    init?: Record<string, any>,
  ): AxiosRequestConfig & { body: any } {
    init = Object.assign({ headers: {} }, init || {})

    for (var kv of Object.entries(this.init.headers)) {
      init.headers[kv[0]] = kv[1]
    }

    return Object.assign(init, this.init) as any
  }

  private async generateCacheKey(
    path: string,
    init: Record<string, any>,
  ): Promise<string> {
    path = new URL(path, this.url).toString()
    init = this.initMerge(init)

    if (init.method != 'POST')
      return JSON.stringify({
        url: path,
        method: init.method,
        headers: init.headers,
      })

    const hash = await sha256(init.body)
    const key = JSON.stringify({
      url: `${path}/_/${hash}`,
      method: 'GET',
      headers: init.headers,
    })

    return key
  }

  private genCacheHeader(cacheTtl?: number, staleTtl?: number): string {
    var cache = 'public'

    if (!cacheTtl || !staleTtl) return cache
    if (cacheTtl < 0 && staleTtl < 0) cache = 'no-store'
    if (cacheTtl >= 0) cache += `, max-age=${cacheTtl}`
    if (staleTtl >= 0) cache += `, stale-while-revalidate=${staleTtl}`

    return cache
  }

  public async fetchWeb3(
    path: string,
    body: any,
    cacheTtl?: number,
    staleTtl?: number,
    init?: Record<string, any>,
  ): Promise<AxiosResponse> {
    const id = body.id
    const method = body.method
    const params = body.params

    body.id = 1

    let cacheHeader
    let defaultBlock
    let isWriteRequest = false

    switch (method) {
      // Should always be from the latest block
      case 'eth_sendRawTransaction':
        isWriteRequest = true
      case 'eth_blockNumber':
      case 'eth_estimateGas':
      case 'eth_feeHistory':
      case 'eth_gasPrice':
        defaultBlock = 'latest'
        break
      // Extract the blocknumber / label
      case 'eth_getBalance':
      case 'eth_getCode':
      case 'eth_getTransactionCount':
      case 'eth_call':
        defaultBlock = params[1]
        break
      case 'eth_getStorageAt':
        defaultBlock = params[2]
        break
      default:
        defaultBlock = 'latest'
        break
    }

    switch (defaultBlock) {
      case 'earliest':
      case 'latest':
      case 'pending':
        cacheHeader = this.genCacheHeader(-1, -1)
        break
      default:
        cacheHeader = this.genCacheHeader(cacheTtl, staleTtl)
    }

    const init_ = Object.assign({ body: JSON.stringify(body) }, init || {})
    let response = await this.fetch(path, cacheHeader, init_)

    response.data.id = id
    return response
  }

  private async fetch(
    path: string,
    cacheHeader: string,
    init?: AxiosRequestConfig & { body: any },
  ): Promise<AxiosResponse> {
    const key = await this.generateCacheKey(path, init)
    init = this.initMerge(init)

    path = new URL(httpConfig.originUrl + path).toString()
    const { body, ...init_ } = init

    if (this.cache?.has(key)) {
      const cachedResponse: CachedResponse = this.cache.get(key)
      return {
        data: cachedResponse.body,
        headers: cachedResponse.headers,
        status: cachedResponse.status,
      } as AxiosResponse
    } else {
      let bodyInjected = await this.injectBlockHash('0x0', body, true)

      if (!bodyInjected) {
        return {
          data: {
            jsonrpc: '2.0',
            id: 1,
            error: {
              code: -32001,
              message: 'Resource not found',
            },
          },
          status: 200,
        } as AxiosResponse
      }

      let response = await axios.post(path, body, init_)

      response.headers['Cache-Control'] = cacheHeader
      if (cacheHeader !== 'no-store') {
        response.headers['X-Cache-Date'] = new Date().toUTCString()
      }
      this.cache?.set(
        key,
        {
          headers: response.headers,
          body: response.data,
          status: response.status,
        },
        this.shortTtl,
      )

      return response
    }
  }

  private async injectBlockHash(
    blockHash: string,
    body: Record<string, any>,
    requireCanonical: boolean = false,
  ): Promise<Record<string, any> | undefined> {
    if (!body.params || !Array.isArray(body.params) || body.params.length < 3) {
      return
    }

    const lastParam = body.params[body.params.length - 1]

    if (
      lastParam &&
      typeof lastParam === 'object' &&
      lastParam.hasOwnProperty('blockHash')
    ) {
      lastParam.blockHash = blockHash
      lastParam.requireCanonical = requireCanonical
    } else {
      body.params.push({
        blockHash: blockHash,
        requireCanonical: requireCanonical,
      })
    }

    return body
  }
}

/**
 * Generate a SHA-256 hash of any object.
 *
 * @param object the object to generate a hash.
 */
async function sha256(object: any): Promise<string> {
  const buffer = new TextEncoder().encode(JSON.stringify(object))
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
}
