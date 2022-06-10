import { logger } from 'common/logger'
import Migration001Nr2 from 'admin/migration/001_2'
import Migration001Nr3 from 'admin/migration/001_3'
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs'
import {
  DynamoDBStreamsClient,
  GetRecordsCommand,
  GetShardIteratorCommand,
} from '@aws-sdk/client-dynamodb-streams'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { SystemInformationEntity } from '../model/admin/SystemInformationEntity'
import { MigrationStatus, SystemInformation } from '../shared/admin/system'
import { ListingEntity } from '../model/ListingEntity'
import EsIndexOps from '../service/es/index-ops'
import { LISTINGS_INDEX_PROPS } from '../service/es'
import Migration001Nr1 from './migration/001_1'
import { MigrationJob } from './index'

export class SystemAdminService {
  readonly allMigrations: Array<MigrationJob>

  constructor() {
    this.allMigrations = [
      new Migration001Nr1(),
      new Migration001Nr2(),
      new Migration001Nr3(),
    ]
  }

  /**
   * Fetch system information data from dynamodb and execute next migrations in the line.
   * @return true in case there is more migrations pending
   */
  async migrateNext(dryRun: boolean = false): Promise<boolean> {
    const systemInformation = await this.getSystemInformation()
    const nextMigrationNumber = +systemInformation.lastMigrationNumber + 1

    logger.info(
      `Received call to migrateNext, dryRun? ${dryRun} nextMigrationNumber ${nextMigrationNumber}`
    )
    logger.info(systemInformation)

    if (this.allMigrations.length < nextMigrationNumber) {
      logger.info(
        `Skipping migration, no new migration with higher version than ${nextMigrationNumber}`
      )
      return false
    }
    const systemInformationEntity = new SystemInformationEntity()
    const migration = this.allMigrations[nextMigrationNumber - 1]

    const migrationStatus: MigrationStatus = {
      type: migration.type(),
      migrationStart: new Date().toLocaleString(),
    }

    migrationStatus.success = await migration.migrate()
    migrationStatus.migrationEnd = new Date().toLocaleString()
    systemInformation.migrationHistory.push(migrationStatus)

    await systemInformationEntity.save(systemInformation)

    logger.info(`Migration result: ${migrationStatus.success}`)

    if (!migrationStatus.success) {
      throw new Error('Migration failed')
    }

    systemInformation.lastMigrationNumber =
      systemInformation.lastMigrationNumber + 1
    if (!dryRun) {
      await systemInformationEntity.save(systemInformation)
    }

    const hasMoreMigrations =
      systemInformation.lastMigrationNumber < this.allMigrations.length
    logger.info(`hasMoreMigrations ${hasMoreMigrations}`)
    return hasMoreMigrations
  }

  async showMigrations() {
    const systemInformation = await this.getSystemInformation()
    return {
      migrationHistory: systemInformation.migrationHistory,
      allMigrations: this.allMigrations.map((m) => m.type()),
      systemInformation,
    }
  }

  /**
   * Fetch dynamodb record that holds information about system version and performed migrations.
   */
  async getSystemInformation(): Promise<SystemInformation> {
    const systemInformationEntity = new SystemInformationEntity()
    const systemInformation = await systemInformationEntity.load()
    if (systemInformation.found) {
      return systemInformation.data
    }

    return await systemInformationEntity.save({
      lastMigrationNumber: 0,
      stage: process.env.STAGE as string,
      migrationHistory: [],
    })
  }

  /**
   * Iterate over all messages in the DLQ and send them to ES index. Delete messages afterwards.
   */
  async sqldlq(): Promise<boolean> {
    const esIndexOps = new EsIndexOps()
    const sqsClient = new SQSClient({ region: process.env.REGION })
    const command = new ReceiveMessageCommand({
      QueueUrl: process.env.LISTING_SQS_DLQ_URL!,
      MaxNumberOfMessages: 10,
    })
    const response = await sqsClient.send(command)

    const dynamoStreamClient = new DynamoDBStreamsClient({
      region: process.env.REGION,
    })
    if (response.Messages) {
      for (let i = 0; i < response.Messages.length; i++) {
        const msg = response.Messages![i]
        const body = JSON.parse(msg.Body as string).DDBStreamBatchInfo

        const iterator = await dynamoStreamClient.send(
          new GetShardIteratorCommand({
            StreamArn: body.streamArn,
            ShardId: body.shardId,
            ShardIteratorType: 'AT_SEQUENCE_NUMBER',
            SequenceNumber: body.startSequenceNumber,
          })
        )
        const records = await dynamoStreamClient.send(
          new GetRecordsCommand({
            ShardIterator: iterator.ShardIterator,
          })
        )

        if (records.Records) {
          for (let h = 0; h < records.Records.length; h++) {
            const record = records.Records[h]
            const dataRecord = unmarshall(record.dynamodb!.NewImage!)
            await esIndexOps.index(dataRecord, LISTINGS_INDEX_PROPS)
          }
        }
        await sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: process.env.LISTING_SQS_DLQ_URL!,
            ReceiptHandle: msg.ReceiptHandle,
          })
        )
      }
    }
    return true
  }

  /**
   * Perform reindexing of all entries from today.
   */
  async reindexCurrentDay(): Promise<boolean> {
    const listingEntity = new ListingEntity()
    const esIndexOps = new EsIndexOps()
    let gsi = await listingEntity.loadGSI(new Date(), undefined)
    while (true) {
      for (const item of gsi.Items!) {
        await esIndexOps.index(item.data, LISTINGS_INDEX_PROPS)
      }
      if (!gsi.LastEvaluatedKey) {
        break
      }
      gsi = await listingEntity.loadGSI(new Date(), gsi.LastEvaluatedKey)
    }

    return true
  }
}
