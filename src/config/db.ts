const dbConfig = {
  region: process.env.DB_REGION || 'us-east-1',
  secret: process.env.DB_SECRET,
  keyId: process.env.DB_KEY_ID,
  tableName: process.env.DB_NAME,
}
export default dbConfig
