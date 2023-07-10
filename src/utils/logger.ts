import { appConfig } from '../config'

function debug(message?: any, ...optionalParams) {
  if (appConfig.logLevel >= 5) {
    console.log(
      `\x1b[36m[DEBUG] ${new Date().toUTCString()} - ${message}  \x1b[0m`,
      ...optionalParams,
    )
  }
}

function info(message?: any, ...optionalParams) {
  if (appConfig.logLevel >= 4) {
    console.log(
      `\x1b[32m[INFO] ${new Date().toUTCString()} - ${message}  \x1b[0m`,
      ...optionalParams,
    )
  }
}

function warn(message?: any, ...optionalParams) {
  if (appConfig.logLevel >= 3) {
    console.log(
      `\x1b[33m[WARN] ${new Date().toUTCString()} - ${message}  \x1b[0m`,
      ...optionalParams,
    )
  }
}

function error(message?: any, ...optionalParams) {
  if (appConfig.logLevel >= 2) {
    console.log(
      `\x1b[31m[ERROR] ${new Date().toUTCString()} - ${message}  \x1b[0m`,
      ...optionalParams,
    )
  }
}

function log(message?: any, ...optionalParams) {
  if (appConfig.logLevel >= 1) {
    console.log(
      `\x1b[37m[FATAL] ${new Date().toUTCString()} - ${message}  \x1b[0m`,
      ...optionalParams,
    )
  }
}

export default {
  debug,
  info,
  error,
  log,
  warn,
}
