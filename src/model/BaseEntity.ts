import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PutCommandInput, QueryCommandInput } from '@aws-sdk/lib-dynamodb/dist-types/ts3.4'
import { EntityObject, MaybeRecord } from './index'

export abstract class BaseEntity<T> {
  readonly fullClient: DynamoDBClient
  readonly documentClient: DynamoDBDocument
  readonly tableName: string

  constructor () {
    this.fullClient = new DynamoDBClient({
    })
    this.documentClient = DynamoDBDocument.from(this.fullClient)
    this.tableName = process.env.DYNAMODB_TABLE_NAME!
  }

  withEntityObject (item: EntityObject<T>) {
    return {
      Item: {
        pk: item.pk,
        sk: item.sk,
        gsi1pk: item.gsi1pk,
        gsi1sk: item.gsi1sk,
        data: item.data
      }
    }
  }

  withTable () {
    return {
      TableName: this.tableName
    }
  }

  withReturnTotalCapacity () {
    return {
      ReturnConsumedCapacity: 'TOTAL'
    }
  }

  async put (putCommand: PutCommandInput): Promise<boolean> {
    try {
      await this.documentClient.put(putCommand)
    } catch (error) {
      console.dir(error)
      return false
    }
    return true
  }

  async singleResultOrError (query: QueryCommandInput): Promise<MaybeRecord<T>> {
    try {
      const result = await this.documentClient.query(query)
      if (result.Items && result.Items.length) {
        if (result.Items.length === 1) {
          return this.recordFound(result.Items[0].data as T)
        } else {
          console.error(`Expected unique result but get ${result.Items.length}`)
          return this.recordNotFound()
        }
      }
    } catch (error) {
      console.dir(error)
      return this.recordNotFound()
    }

    return this.recordNotFound()
  }

  async multipleResults (query: QueryCommandInput): Promise<T[]> {
    try {
      const result = await this.documentClient.query(query)
      if (result.Items && result.Items.length) {
        return result.Items.map(e => e.data as T)
      }
    } catch (error) {
      console.dir(error)
      return []
    }

    return []
  }

  recordFound = (data: T): MaybeRecord<T> => {
    return {
      found: true,
      data
    }
  }

  recordNotFound = (): MaybeRecord<T> => {
    return {
      found: false,
      data: {} as T
    }
  }
}
