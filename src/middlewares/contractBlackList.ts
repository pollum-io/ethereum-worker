import { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger'
import { blacklistConfig } from '../config'

async function filterBlacklist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const stringBody = JSON.stringify(req.body).toLowerCase()
  let blocked = blacklistConfig.blacklist.isBlacklisted(stringBody)

  if (blocked) {
    res.status(401).send()
    logger.debug('BlackListed')
  } else {
    next()
  }
}

export default filterBlacklist
