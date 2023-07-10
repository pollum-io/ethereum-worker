import { AxiosResponseHeaders } from 'axios'

declare type DefaultBodyRequest = {
  id: number
  method: string
  jsonrpc: string
  params: (string | number)[]
}
declare type BatchBodyRequest = DefaultBodyRequest[]

declare type BodyRequest = DefaultBodyRequest | BatchBodyRequest

declare type CachedResponse = {
  headers: AxiosResponseHeaders
  body: string
  status: number
}
