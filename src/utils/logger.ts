import { appConfig } from '../config'
// import pino from 'pino'
// const log = pino()

function debug(message?: any, ...optionalParams) {
  if (appConfig.environment === 'dev') {
    // log.debug()
    console.log(message, ...optionalParams)
  }
}

function info(message?: any, ...optionalParams) {
  console.log(message, ...optionalParams)
}

export default {
  debug,
  info,
}
