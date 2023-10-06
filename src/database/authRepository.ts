import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ScanCommand,
  ScanCommandInput,
  PutItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb'
import { dbConfig } from '../config'
import logger from '../utils/logger'
import { v4 as uuid } from 'uuid'

class AuthRepository {
  private client: DynamoDBClient
  private dbReady: boolean = false
  private tableName: string

  constructor(credentials: typeof dbConfig) {
    this.tableName = credentials.tableName
    this.client = new DynamoDBClient({
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.keyId,
        secretAccessKey: credentials.secret,
      },
    })
    this.checkDB(credentials.tableName)
  }

  private checkDB(tableName: string): void {
    const describeTable = new DescribeTableCommand({
      TableName: tableName,
    })

    this.client
      .send(describeTable)
      .then(data => {
        logger.info('Table found.')
        this.dbReady = true
      })
      .catch(error => {
        logger.warn('Table not found. Creating a new one.', error)
        const createCommand = new CreateTableCommand({
          TableName: tableName,
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'key',
              KeyType: 'RANGE',
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
            {
              AttributeName: 'key',
              AttributeType: 'S',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        })
        this.client
          .send(createCommand)
          .then(data => {
            logger.info('Table created.')
          })
          .catch(error => {
            logger.error("Wasn't possible to create ta table.", error)
          })
      })
  }

  public async getAuthKeys(lastKey?: ScanCommandInput['ExclusiveStartKey']) {
    let command = new ScanCommand({
      TableName: this.tableName,
      Limit: 1000,
      ExclusiveStartKey: lastKey,
    })
    try {
      const data = await this.client.send(command)
      return {
        items: data.Items,
        count: data.Count,
        lastKey: data.LastEvaluatedKey,
      }
    } catch (error) {
      logger.error('Fail to get entries from auth table.')
    }
  }
  public async createKey(
    name: string,
    role: string,
    key: string,
    id: string = uuid(),
  ) {
    let command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        id: { S: id },
        key: { S: key },
        name: { S: name },
        role: { S: role },
        enabled: { BOOL: true },
      },
    })
    await this.client.send(command)
    return {
      id,
      key,
      name,
      role,
      enabled: true,
    }
  }

  public async invalidKey(id: string) {
    let command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: id },
      },
      UpdateExpression: 'SET enabled = :value',
      ExpressionAttributeValues: {
        ':value': { BOOL: false },
      },
    })
    await this.client.send(command)
    return true
  }

  public ready() {
    return this.dbReady
  }
}

export default AuthRepository
const authRepository = new AuthRepository(dbConfig)

export { authRepository }
