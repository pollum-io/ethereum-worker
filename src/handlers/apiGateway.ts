import { Request, Response } from 'express'
import { authRepository } from '../database/authRepository'
import { auth } from '../lib/auth'
import { v4 as uuid } from 'uuid'

export async function createKey(req: Request, res: Response) {
  const id = uuid()
  const { role, name } = req.query
  if (!role || !name || typeof name !== 'string' || typeof role !== 'string') {
    return res.status(400).json({
      message: 'Invalid params',
    })
  }

  const key = auth.createKey(id, role)

  const data = await authRepository.createKey(name, role, key, id)

  return res.status(200).json(data)
}

export function invalidateKey(req: Request, res: Response) {
  // auth.checkKey()
  // authRepository.invalidKey()

  return res.status(201).send()
}
