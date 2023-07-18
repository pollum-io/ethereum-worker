import { NextFunction, Request, Response } from 'express'
import { appConfig } from '../config'

async function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const body = req.body

  if (Array.isArray(body)) {
    body.map(({ method }) => {
      if (method) appConfig.metrics.countMethod(method)
    })
  } else {
    const { method } = body
    if (method) appConfig.metrics.countMethod(method)
  }
  appConfig.metrics.countRequest()

  next()
}

export default metricsMiddleware
