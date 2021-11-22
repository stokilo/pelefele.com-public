import { logger } from 'common/logger'
import ListingsIndexConfig from 'service/es/indexes/listings'
import { MigrationJob } from 'admin/index'

/**
 * Migration 002: create index for property listings
 */
export default class Migration001Nr2 implements MigrationJob {
  type (): string {
    return 'ES_INDEX_FOR_LISTINGS'
  }

  async migrate (): Promise<boolean> {
    console.info(`Migrate ${this.type()}`)
    return await this.migrateES()
  }

  async migrateES (): Promise<boolean> {
    logger.info('Index creation')
    const listingsIndexConfig = new ListingsIndexConfig()
    const indexCreated = await listingsIndexConfig.configureIndex(true)
    logger.info(`Index created? ${indexCreated}`)
    return true
  }
}
