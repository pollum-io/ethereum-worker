const httpConfig = {
  port: process.env.PORT || 3000,
  originUrl: process.env.ORIGIN_URL || 'localhost:8545',
  writeUrl: process.env.WRITE_URL || 'localhost:8545',
  adminCheckToken: process.env.ADMIN_CHECK_TOKEN || 'token',
  authSecret: process.env.AUTH_KEY_SECRET || 'small default secret',
}

export default httpConfig
