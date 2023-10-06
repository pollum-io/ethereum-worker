import { Request, Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import { auth } from '../lib/auth'

async function getLimitByKey(req: Request, res: Response): Promise<number> {
  const authHeader = req.headers.authorization
  if (typeof authHeader === 'string' && !!authHeader.trim()) {
    const parts = authHeader.split(' ')

    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      const userData = auth.checkKey(parts[1])
      switch (userData?.role) {
        case 'partner':
          return 100000
        case 'premium':
          return 1000
        default:
          return 10
      }
    }
  }
  return 100
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: getLimitByKey,
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: new RedisStore({
  // 	/* ... */
  // }), // Use the external store
})

export default limiter
