import { Request, Response } from 'express'
import { httpConfig } from '../config'
import axios from 'axios'
import logger from '../utils/logger'

async function health(req: Request, res: Response) {
  let response = await axios.post(`${httpConfig.originUrl}`, {
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    id: 1,
    params: [],
  })
  logger.debug('RES', response)

  if (response.data.result === '0x0') {
    return res.status(400).json({ health: 'Rpc Not ready' })
  }

  return res.status(200).json({ health: 'Rpc ready' })
}

export default health
