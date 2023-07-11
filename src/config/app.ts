import { Metrics } from '../lib/metrics'

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
  metrics: new Metrics(),
}
export default appConfig
