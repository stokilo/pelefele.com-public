import EsClient from 'service/es/es-client'
import { logger } from 'common/logger'
import { Client } from '@elastic/elasticsearch'
import { EsIndexProps } from 'service/es/index'

export default class EsIndexOps {
  readonly esClient: EsClient
  client: Client

  constructor () {
    this.esClient = new EsClient(process.env.REGION as string)
  }

  public async getClient () : Promise<Client> {
    if (this.client) {
      return this.client
    }
    this.client = await this.esClient.getEsClient()
    return this.client
  }

  public async index<T> (document: T, esIndexProps: EsIndexProps) : Promise<boolean> {
    try {
      const client = await this.getClient()
      const result = await client.index({
        index: esIndexProps.indexName(),
        body: document
      })

      return result.statusCode === 201
    } catch (e) {
      logger.error(e)
    }
    return false
  }

  public async bulkInsert<T> (dataset: Array<T>, esIndexProps: EsIndexProps) {
    try {
      logger.time(`Processing ${dataset.length} documents`)
      const client = await this.getClient()
      const toIndex = dataset.flatMap(doc => [{ index: { _index: esIndexProps.indexName() } }, doc])
      const bulkResult = await client.bulk({
        refresh: true,
        body: toIndex
      })
      logger.timeEnd(`Processing ${dataset.length} documents`)
      return bulkResult.statusCode === 200
    } catch (e) {
      logger.error(e)
      return false
    }
  }

  public async indexExists (esIndexProps: EsIndexProps): Promise<boolean> {
    try {
      const client = await this.getClient()
      const result = await client.indices.exists({
        index: esIndexProps.indexName()
      })
      return result.body
    } catch (e) {
      logger.error(e)
      return false
    }
  }

  public async deleteIndex (esIndexProps: EsIndexProps): Promise<boolean> {
    try {
      const client = await this.getClient()
      const result = await client.indices.delete({ index: esIndexProps.indexName() })
      return result.statusCode === 200
    } catch (e) {
      logger.error(e)
      return false
    }
  }
}
