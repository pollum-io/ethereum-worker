import { Request, Response } from 'express'
import { cacheConfig, httpConfig, appConfig } from '../config'

export async function getMetrics(req: Request, res: Response) {
  if (!req.query?.token || req.query?.token !== httpConfig.adminCheckToken) {
    return res.status(401).json({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32601,
        message: `Unauthorized`,
      },
    })
  }
  res.status(200).json({
    cache: cacheConfig.cache.getStats(),
    requests: {
      reqPerHour: appConfig.metrics.getRequestCount(),
    },
  })
}
