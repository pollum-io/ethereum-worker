import { httpConfig } from '../config'
import AuthRepository, { authRepository } from '../database/authRepository'
import logger from '../utils/logger'
import crypto from 'crypto'

interface User {
  key: string
  id: string
  role: string
  name: string
  enabled: boolean
}

class Auth {
  private readonly jobs?: NodeJS.Timeout[] = []
  private readonly authRepository: AuthRepository
  private cachedKeys = new Map<string, User>()

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository
    this.jobs.push(
      setInterval(() => {
        if (this.authRepository.ready) {
          logger.debug('Reload auth for memory')
          this.reloadCache()
        } else {
          logger.debug('DB is not ready. Any entries will be load to the cache')
        }
      }, 60 * 15 * 1000), // 15 minutes
    )

    if (this.authRepository.ready) {
      logger.debug('Reloading auth for memory')
      this.reloadCache()
    }
  }

  private async reloadCache() {
    try {
      // Load data from db to the memory
      const { items } = await this.authRepository.getAuthKeys()
      this.cachedKeys.clear()

      items.forEach(item => {
        this.cachedKeys.set(item.key.S, {
          enabled: item.enabled.BOOL,
          id: item.id.S,
          role: item.role.S,
          name: item.name.S,
          key: item.key.S,
        })
      })
    } catch (error) {
      logger.error('Error reloading cache:', error.message)
    }
  }

  private generateHash(id: string, role: string): string {
    const hmac = crypto.createHmac('sha256', httpConfig.authSecret)
    hmac.update(id)
    hmac.update(role)
    hmac.update('pollum.io')

    const key = hmac.digest('hex')
    return key
  }

  private isValidKey(userKey: string, id: string, role: string): boolean {
    const keyToValid = this.generateHash(id, role)
    return keyToValid === userKey
  }

  public createKey(id: string, role: string): string {
    try {
      const key = this.generateHash(id, role)
      return key
    } catch (error) {
      console.error('Error generating key:', error.message)
      throw new Error('Key generation failed')
    }
  }

  public checkKey(key: string): { role: string; id: string } | undefined {
    const user = this.cachedKeys.get(key)
    if (user) {
      const isValid = this.isValidKey(key, user.id, user.role)
      if (isValid) {
        return { role: user.role, id: user.id }
      }
    }
    return undefined // Key is not valid
  }
}

export default Auth

const auth = new Auth(authRepository)
export { auth }
