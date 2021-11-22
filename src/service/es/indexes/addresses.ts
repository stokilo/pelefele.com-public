import { logger } from 'common/logger'
import EsIndexOps from 'service/es/index-ops'
import { ADDRESSES_INDEX_PROPS, EsIndexConfig } from '../index'

export default class AddressesIndexConfig implements EsIndexConfig {
  readonly esIndexOps: EsIndexOps

  constructor () {
    this.esIndexOps = new EsIndexOps()
  }

  public async configureIndex (recreate: boolean): Promise<boolean> {
    const client = await this.esIndexOps.getClient()
    if (recreate) {
      const indexExists = await this.esIndexOps.indexExists(ADDRESSES_INDEX_PROPS)
      if (indexExists) {
        await this.esIndexOps.deleteIndex(ADDRESSES_INDEX_PROPS)
      }
    }

    try {
      const indexCreate = await client.indices.create({
        index: ADDRESSES_INDEX_PROPS.indexName(),
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                autocomplete: {
                  tokenizer: 'autocomplete',
                  filter: [
                    'lowercase'
                  ]
                },
                autocomplete_search: {
                  tokenizer: 'lowercase'
                }
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: [
                    'letter'
                  ]
                }
              }
            }
          }
        }
      }, { ignore: [400] })

      if (indexCreate.statusCode !== 200) {
        return false
      }

      // https://coralogix.com/blog/elasticsearch-autocomplete-with-search-as-you-type/
      // TODO: consider each field (provinceName, county, borough, city, street) and adjust boost
      // TODO: testcase find a) all from malopolska b) all from krakow c) all from krakow krowodrza d) all from krakow zwierzyniecka
      // TODO: add city name to last part of CSV to improve search and have city before street
      const mapping = await client.indices.put_mapping({
        index: ADDRESSES_INDEX_PROPS.indexName(),
        type: 'address',
        include_type_name: true,
        body: {
          address: {
            properties: {
              city: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search'
              },
              street: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search'
              },
              location: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search'
              }
            }
          }
        }
      })

      return mapping.statusCode === 200
    } catch (e) {
      logger.error(e)
      return false
    }
  }
}
