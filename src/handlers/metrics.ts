import { Request, Response } from 'express'
import { cacheConfig, httpConfig, appConfig } from '../config'

export async function getMetrics(req: Request, res: Response) {
  const reqCount = appConfig.metrics.getRequestCount()

  res.status(200).json({
    cache: cacheConfig.cache.getStats(),
    requests: reqCount,
  })
}

export async function getCurrentMetrics(req: Request, res: Response) {
  const stats = appConfig.metrics.currentMetrics()

  res.status(200).json({
    stats,
  })
}
