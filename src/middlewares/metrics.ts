import { NextFunction, Request, Response } from 'express'
import { appConfig } from '../config'

async function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  appConfig.metrics.countRequest()

  next()
}

export default metricsMiddleware
