import { Request, Response } from 'express'
import { blacklistConfig } from '../config'

export function addToBlacklist(req: Request, res: Response) {
  const { contract } = req.query

  const parsedContract = contract.toString()

  if (!parsedContract.trim()) {
    return res.status(400).json({
      message: 'Invalid contract',
    })
  }

  blacklistConfig.blacklist.addToBlacklist(parsedContract)

  return res.status(201).send()
}

export function removeFromBlacklist(req: Request, res: Response) {
  const { contract } = req.query

  const parsedContract = contract.toString()

  if (!parsedContract.trim()) {
    return res.status(400).json({
      message: 'Invalid contract',
    })
  }

  blacklistConfig.blacklist.removeFromBlacklist(parsedContract)

  return res.status(201).send()
}
