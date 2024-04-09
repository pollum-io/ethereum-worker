import { Metrics } from '../lib/metrics'
import cacheConfig from './cache'

// period = 60 * 60 * 24 * 30 = 30 days(seconds)
// interval = 60 * 60 = 1h (seconds)
const metricsPeriod = process.env.METRICS_PERIODS
  ? parseInt(process.env.METRICS_PERIODS)
  : 60 * 60 * 24 * 30
const metricsInterval = process.env.METRICS_INTERVAL
  ? parseInt(process.env.METRICS_INTERVAL)
  : 60 * 60

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
  metrics: new Metrics(cacheConfig.cache, metricsInterval, metricsPeriod),
}
export default appConfig
