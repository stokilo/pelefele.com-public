import { logger } from 'common/logger'
import EsIndexOps from 'service/es/index-ops'
import {
  LocationSearchResults,
  LocationSearchResultSchema
} from 'shared/listing/search'
import { ADDRESSES_INDEX_PROPS, EsAddressDocument, EsIndexSearch } from '../index'

export default class AddressesIndexSearch implements EsIndexSearch<LocationSearchResults> {
  readonly esIndexOps: EsIndexOps

  constructor () {
    this.esIndexOps = new EsIndexOps()
  }

  public async search (searchParams: { [key: string]: string }): Promise<LocationSearchResults> {
    const locationSearchResults: LocationSearchResults = {
      locations: []
    }
    try {
      const terms = searchParams.term.split(' ')
      const boost = terms.length > 1 ? 100 : 0
      const term1 = terms.length ? terms.shift() : ''
      const term2 = !terms.length ? term1 : terms.join(' ')

      logger.info(`status: term1: [${term1}] term2: [${term2}] boost: [${boost}] searchParams.term: [${searchParams.term}]`)

      const client = await this.esIndexOps.getClient()
      const searchResult = await client.search({
        index: ADDRESSES_INDEX_PROPS.indexName(),
        body: {
          size: 10,
          query: {
            match: {
              location: {
                query: searchParams.term,
                fuzziness: 0,
                operator: 'and'
              }
            }
          }
          // query: {
          //   multi_match: {
          //     query: searchParams.term,
          //     type: 'most_fields',
          //     fields: [
          //       'city^10',
          //       'street^5',
          //       'location^20'
          //     ]
          //   }
          // }
        }
      }
      )

      logger.info(searchResult.body.hits, 'SearchResult::')
      if (searchResult.statusCode === 200) {
        locationSearchResults.locations = searchResult.body.hits.hits.map(
          (e: { _source: EsAddressDocument }) => LocationSearchResultSchema.parse(e._source)
        )
      }
    } catch
    (e) {
      logger.error(e)
    }
    return locationSearchResults
  }
}
