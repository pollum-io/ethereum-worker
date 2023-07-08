const httpConfig = {
  port: process.env.PORT || 3000,
  originUrl: process.env.ORIGIN_URL || 'localhost:8545',
  writeUrl: process.env.WRITE_URL || 'localhost:8545',
}

export default httpConfig
