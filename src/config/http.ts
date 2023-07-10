const httpConfig = {
  port: process.env.PORT || 3000,
  originUrl: process.env.ORIGIN_URL || 'localhost:8545',
  writeUrl: process.env.WRITE_URL || 'localhost:8545',
  adminCheckToken: process.env.ADMIN_CHECK_TOKEN || 'token',
}

export default httpConfig
