import { QueryCommandOutput } from '@aws-sdk/lib-dynamodb/dist-types/commands/QueryCommand'
import { TransactWriteCommandOutput } from '@aws-sdk/lib-dynamodb/dist-types/commands/TransactWriteCommand'
import { BatchWriteCommandOutput } from '@aws-sdk/lib-dynamodb/dist-types/commands/BatchWriteCommand'

/**
 * Simplest logger possible
 */
class AppLogger {
  /**
   * Output logs on PROD to stdout to be searchable by AWS services like Athena.
   * console.log* functions don't output by default to std out. However in dev mode it is convenient to have
   * output formatted, that is why IS_LOCAL check is performed.
   * @param obj
   */
  obj2stdout (obj: any) {
    if (process.env.IS_LOCAL) {
      console.info(obj)
    } else {
      process.stdout.write(JSON.stringify(obj) + '\n')
    }
  }

  string2stdio (data: string) {
    process.stdout.write(data + '\n')
  }

  info (obj: any, message: string = '') {
    if (message.length) {
      this.obj2stdout(message)
    }
    this.obj2stdout(obj)
  }

  debug (obj: any, message: string = '') {
    if (process.env.IS_LOCAL) {
      if (message.length) {
        this.obj2stdout(message)
      }
      this.obj2stdout(obj)
    }
  }

  error (err: any) {
    console.info(`is local ${process.env.IS_LOCAL}`)
    if (process.env.IS_LOCAL) {
      this.obj2stdout({ name: err.name, message: err.message, stack: err.stack })
    } else {
      this.string2stdio(JSON.stringify({ name: err.name, message: err.message, stack: err.stack }))
    }
  }

  time (obj: string) {
    console.time(obj)
  }

  timeEnd (obj: string) {
    console.timeEnd(obj)
  }

  debugDynamo (action: string, result: QueryCommandOutput) {
    this.debug({
      Action: action,
      ScannedCount: result.ScannedCount,
      ConsumedCapacity: {
        CapacityUnits: result.ConsumedCapacity?.CapacityUnits
      }
    })
  }

  debugDynamoTransact (action: string, result: TransactWriteCommandOutput) {
    this.debug({
      Action: action,
      ConsumedCapacity: result.ConsumedCapacity
    })
  }

  debugDynamoBatch (action: string, result: BatchWriteCommandOutput) {
    this.debug({
      Action: action,
      UnprocessedItems: result.UnprocessedItems
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  replaceError (key:any, value: any) {
    if (value instanceof Error) {
      const newValue = Object.getOwnPropertyNames(value)
        .reduce((obj, propName) => {
          // @ts-ignore
          obj[propName] = value[propName]
          return obj
        }, { name: value.name })
      return newValue
    } else {
      return value
    }
  }
}

export const logger = new AppLogger()
