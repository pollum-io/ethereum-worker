import { Metrics } from '../lib/metrics'
import cacheConfig from './cache'

const appConfig = {
  environment: (process.env.NODE_ENV || 'development') as
    | 'development'
    | 'production',
  logLevel:
    process.env.NODE_ENV === 'development'
      ? 5
      : parseInt(process.env.LOG_LEVEL) >= 0
      ? parseInt(process.env.LOG_LEVEL)
      : 4,
  metrics: new Metrics(cacheConfig.cache, 60 * 5, 60 * 60 * 24),
  // metrics: new Metrics(cacheConfig.cache, 30, 60 * 5),
}
export default appConfig
