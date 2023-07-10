import { createProxyMiddleware } from 'http-proxy-middleware'
import { parseFrame } from '../lib/inflate'
import blackList from '../config/blacklist'
import logger from '../utils/logger'
import { LogProviderCallback } from 'http-proxy-middleware/dist/types'
import wsConfig from '../config/ws'

const logProvider: LogProviderCallback = provider => {
  return {
    log: logger.log,
    debug: logger.debug,
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
  }
}

const wsMiddleware = createProxyMiddleware({
  target: wsConfig.url,
  changeOrigin: false,
  ws: true,
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    socket.on('data', d => {
      const inflatedMessage = parseFrame(d)
      if (inflatedMessage) {
        const message = inflatedMessage.toLowerCase()
        for (var i in blackList) {
          if (message.includes(blackList[i].toLocaleLowerCase())) {
            socket.end()
            proxyReq.socket?.end()
          }
        }
      }
    })
  },
  logProvider,
  pathRewrite: {
    '/wss*': '/',
  },
})

export default wsMiddleware
