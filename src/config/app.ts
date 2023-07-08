const appConfig = {
  environment: (process.env.ENVIRONMENT || 'dev') as 'dev' | 'prod',
}
export default appConfig
