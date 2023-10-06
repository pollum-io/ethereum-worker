import { Request, Response } from 'express'
import { authRepository } from '../database/authRepository'
import { auth } from '../lib/auth'
import { v4 as uuid } from 'uuid'

export async function createKey(req: Request, res: Response) {
  try {
    // Generate a unique ID for the user
    const id = uuid()

    const role = sanitizeString(req.query.role)
    const name = sanitizeString(req.query.name)

    if (!role || !name) {
      throw new Error('Invalid role or name')
    }

    const key = auth.createKey(id, role)
    const data = await authRepository.createKey(name, role, key, id)

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error creating user key:', error.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

function sanitizeString(input: any): string | null {
  if (typeof input === 'string') {
    return input.trim()
  }
  return null
}

export function invalidateKey(req: Request, res: Response) {
  // auth.checkKey()
  // authRepository.invalidKey()

  return res.status(201).send()
}
