import { logger } from 'common/logger'
import EsIndexOps from 'service/es/index-ops'
import { ListingsSearchResults } from 'shared/listing/search'
import {
  Listing,
  LISTING_SORT_AREA_ASC,
  LISTING_TARGET_RENTAL,
  LISTING_TYPE_HOUSE,
  ListingSchema,
  sort2Es,
} from 'shared/listing/listing'
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy'
import { EsIndexSearch, LISTINGS_INDEX_PROPS, MAX_ES_INT } from '../index'

export default class ListingsIndexSearch
  implements EsIndexSearch<ListingsSearchResults>
{
  readonly esIndexOps: EsIndexOps

  constructor() {
    this.esIndexOps = new EsIndexOps()
  }

  public async search(
    searchParams: APIGatewayProxyEventQueryStringParameters | null
  ): Promise<ListingsSearchResults> {
    const listingsSearchResults: ListingsSearchResults = {
      listings: [],
      totalCount: 0,
      took: '',
    }

    if (!searchParams) {
      return listingsSearchResults
    }

    const locationPk = ListingsIndexSearch.parseString(
      searchParams,
      'locationPk',
      ''
    )
    const locationSk = ListingsIndexSearch.parseString(
      searchParams,
      'locationSk',
      ''
    )

    if (!locationPk.length || !locationSk.length) {
      return listingsSearchResults
    }

    const minPrice = ListingsIndexSearch.parseNumber(
      searchParams,
      'minPrice',
      0
    )
    const maxPrice = ListingsIndexSearch.replaceValue(
      ListingsIndexSearch.parseNumber(searchParams, 'maxPrice', MAX_ES_INT),
      0,
      MAX_ES_INT
    )

    const minArea = ListingsIndexSearch.parseNumber(searchParams, 'minArea', 0)
    const maxArea = ListingsIndexSearch.replaceValue(
      ListingsIndexSearch.parseNumber(searchParams, 'maxArea', MAX_ES_INT),
      0,
      MAX_ES_INT
    )

    const pageSize = ListingsIndexSearch.parseNumber(
      searchParams,
      'pageSize',
      0
    )
    const pageNr = ListingsIndexSearch.parseNumber(searchParams, 'pageNr', 0)

    const listingType = ListingsIndexSearch.parseString(
      searchParams,
      'listingType',
      LISTING_TYPE_HOUSE.id
    )
    const listingTarget = ListingsIndexSearch.parseString(
      searchParams,
      'listingTarget',
      LISTING_TARGET_RENTAL.id
    )

    const listingSort = ListingsIndexSearch.parseString(
      searchParams,
      'listingSort',
      LISTING_SORT_AREA_ASC.id
    )
    const esSort = sort2Es(listingSort.toString())
    const esSortElem = Object.keys(esSort).length ? [esSort] : []

    logger.info(`location [${locationPk}, ${locationSk}]`)
    logger.info(`pageSize ${pageSize} pageNr ${pageNr}`)
    logger.info(`minArea ${minArea} maxArea ${maxArea}`)
    logger.info(`minPrice ${minPrice} maxPrice ${maxPrice}`)
    logger.info(`listingType ${listingType} listingTarget ${listingTarget}`)
    logger.info(
      `listingSort ${listingSort} esSortElem ${JSON.stringify(esSortElem)}`
    )

    try {
      const client = await this.esIndexOps.getClient()
      const searchResult = await client.search({
        index: LISTINGS_INDEX_PROPS.indexName(),
        body: {
          size: pageSize,
          from: pageSize * (pageNr - 1),
          sort: esSortElem,
          query: {
            bool: {
              must: [
                {
                  prefix: {
                    locationPk,
                  },
                },
                {
                  prefix: {
                    locationSk,
                  },
                },
                {
                  match: {
                    target: listingTarget,
                  },
                },
                {
                  match: {
                    type: listingType,
                  },
                },
                {
                  range: {
                    price: {
                      gte: minPrice,
                      lte: maxPrice,
                    },
                  },
                },
                {
                  range: {
                    area: {
                      gte: minArea,
                      lte: maxArea,
                    },
                  },
                },
              ],
            },
          },
        },
      })

      logger.info(
        `count: ${searchResult.body.hits.total.value} took: ${searchResult.body.took} ms`,
        'SearchResult::'
      )
      if (searchResult.statusCode === 200) {
        listingsSearchResults.listings = searchResult.body.hits.hits.map(
          (e: { _source: Listing }) => ListingSchema.parse(e._source)
        )
        listingsSearchResults.totalCount = searchResult.body.hits.total.value
        listingsSearchResults.took = searchResult.body.took.toString()
      }
    } catch (e) {
      logger.error(e)
    }

    return listingsSearchResults
  }

  private static parseNumber(
    searchParams: APIGatewayProxyEventQueryStringParameters,
    paramName: string,
    defaultValue: number
  ): number {
    if (paramName in searchParams) {
      const val = +(searchParams[paramName] as string)
      return isNaN(val) || val < 0 || val > MAX_ES_INT ? defaultValue : val
    }

    return defaultValue
  }

  private static parseString(
    searchParams: APIGatewayProxyEventQueryStringParameters,
    paramName: string,
    defaultValue: string
  ): string {
    if (paramName in searchParams) {
      return searchParams[paramName] as string
    }

    return defaultValue
  }

  private static replaceValue(
    realValue: number,
    toReplaceValue: number,
    replacement: number
  ) {
    return realValue === toReplaceValue ? replacement : realValue
  }
}
