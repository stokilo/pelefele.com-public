import { logger } from 'common/logger'
import { readTextBucket } from 's3/s3-reader'
import parse from 'csv-parse/lib/sync'
import AddressesIndexConfig from 'service/es/indexes/addresses'
import EsIndexOps from 'service/es/index-ops'
import { EsAddressDocument, ADDRESSES_INDEX_PROPS } from 'service/es'
import { MigrationJob } from 'admin/index'

const appBucketName = process.env.APP_BUCKET_NAME as string

/**
 * Migration 001: import address autocomplete from S3 to ES and DynamoDB
 */
export default class Migration001Nr1 implements MigrationJob {
  type (): string {
    return 'IMPORT_ADDRESS_ES'
  }

  // getObjectKeyToImport = (): string => '0.1/data-sql.csv'
  getObjectKeyToImport = (): string => '0.1/data-sql.csv'

  async migrate (): Promise<boolean> {
    console.info(`Migrate ${this.type()}`)
    return await this.migrateES()
  }

  async migrateES (): Promise<boolean> {
    logger.info(`Start es data import from: ${appBucketName}/${this.getObjectKeyToImport()}`)
    const addressImportCSV = await readTextBucket(appBucketName, this.getObjectKeyToImport())
    const csvFile = parse(addressImportCSV, {
      columns: true,
      bom: true,
      delimiter: ',',
      skipEmptyLines: true
    })

    logger.info('Index creation')
    const addressesIndexConfig = new AddressesIndexConfig()
    logger.info('Index configure')
    const indexCreate = await addressesIndexConfig.configureIndex(true)
    logger.info(`Index created ? ${indexCreate}`)

    const batchEsDocuments = []
    let keys: { [key: string]: any } = {}

    try {
      logger.info(`Number of rows to process ${csvFile.length}`)
      logger.time('Processing all records')
      let total = 0
      const esIndexOps = new EsIndexOps()
      for (let i = 0; i < csvFile.length; i++) {
        const record = csvFile[i]

        // STREET,CITY,WOJ,POW,GMI,MZ,RM,LOCATION_NAME_V1,LOCATION_NAME_V2,LOCATION_NAME_V3,LOCATION_ID,FULL_LOCATION_ID
        const street = record.STREET
        const city = record.CITY
        // const woj = record.WOJ
        // const pow = record.POW
        // const gmi = record.GMI
        // const mz = record.MZ
        // const rm = record.RM
        // const licationName1 = record.LOCATION_NAME_V1
        // const locationName2 = record.LOCATION_NAME_V2
        const locationName3 = record.LOCATION_NAME_V3
        // const locationId = record.location_id
        const fullLocationId = record.FULL_LOCATION_ID

        const pk = fullLocationId
        const sk = fullLocationId
        const locationArray = locationName3.split(' ')
        const location = locationArray.map((e: string) => e.charAt(0) + e.slice(1).toLowerCase()).join(' ').replace('-', ' ')

        const esDocument: EsAddressDocument = {
          pk, sk, city, street, location
        }
        if (!(pk in keys)) {
          batchEsDocuments.push(esDocument)
          keys[pk] = true
        }

        if (batchEsDocuments.length === 2000 || i === csvFile.length - 1) {
          total = total + batchEsDocuments.length
          const esInsert = await esIndexOps.bulkInsert(batchEsDocuments, ADDRESSES_INDEX_PROPS)
          if (!esInsert) {
            logger.info('Failed to insert to ES index')
            return false
          }

          batchEsDocuments.splice(0, batchEsDocuments.length)
          keys = {}
        }
      }
      logger.timeEnd('Processing all records')
      logger.info(`Processed ${total} es documents`)
    } catch (e) {
      logger.error(e)
      return false
    }

    return true
  }
}
