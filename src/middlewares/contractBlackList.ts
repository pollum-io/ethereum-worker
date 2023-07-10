import { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger'
import blackList from '../config/blacklist'

async function filterBlacklist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const stringBody = JSON.stringify(req.body).toLowerCase()
  let blocked = false
  blackList.forEach(function(contract) {
    if (stringBody.includes(contract.toLowerCase())) {
      blocked = true
    }
  })

  if (blocked) {
    res.status(401).send()
    logger.debug('BlackListed')
  } else {
    next()
  }
}

export default filterBlacklist
