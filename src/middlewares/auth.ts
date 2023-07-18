import { NextFunction, Request, Response } from 'express'
import { httpConfig } from '../config'

function auth(req: Request, res: Response, next: NextFunction) {
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

  next()
}

export default auth
