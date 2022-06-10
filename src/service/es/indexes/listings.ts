import { logger } from 'common/logger'
import EsIndexOps from 'service/es/index-ops'
import { EsIndexConfig, LISTINGS_INDEX_PROPS } from '../index'

export default class ListingsIndexConfig implements EsIndexConfig {
  readonly esIndexOps: EsIndexOps

  constructor() {
    this.esIndexOps = new EsIndexOps()
  }

  public async configureIndex(recreate: boolean): Promise<boolean> {
    const client = await this.esIndexOps.getClient()
    if (recreate) {
      const indexExists = await this.esIndexOps.indexExists(
        LISTINGS_INDEX_PROPS
      )
      if (indexExists) {
        await this.esIndexOps.deleteIndex(LISTINGS_INDEX_PROPS)
      }
    }

    try {
      const indexCreate = await client.indices.create(
        {
          index: LISTINGS_INDEX_PROPS.indexName(),
          body: {
            settings: {
              number_of_shards: 1,
            },
          },
        },
        { ignore: [400] }
      )

      if (indexCreate.statusCode !== 200) {
        return false
      }

      const mapping = await client.indices.put_mapping({
        index: LISTINGS_INDEX_PROPS.indexName(),
        include_type_name: true,
        type: 'listing',
        body: {
          listing: {
            properties: {
              title: {
                type: 'text',
              },
              pk: {
                type: 'text',
              },
              sk: {
                type: 'text',
              },
              type: {
                type: 'integer',
              },
              target: {
                type: 'integer',
              },
              area: {
                type: 'integer',
              },
              price: {
                type: 'integer',
              },
              location: {
                type: 'text',
              },
              locationPk: {
                type: 'keyword',
              },
              locationSk: {
                type: 'keyword',
              },
            },
          },
        },
      })

      return mapping.statusCode === 200
    } catch (e) {
      logger.error(e)
      return false
    }
  }
}
