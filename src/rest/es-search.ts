import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { logger } from 'common/logger'
import { http200WithJSONBody, queryParam } from 'rest'
import AddressesIndexSearch from 'service/es/indexes/addresses-search'
import ListingsIndexSearch from 'service/es/indexes/listings-search'

const addressesIndexSearch = new AddressesIndexSearch()
const listingsIndexSearch = new ListingsIndexSearch()

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  try {
    const term = queryParam(event, 'term')
    const index = queryParam(event, 'index')

    let resultObj = {}
    if (index === 'address') {
      resultObj = await addressesIndexSearch.search({ term })
    } else if (index === 'listing') {
      resultObj = await listingsIndexSearch.search(event.queryStringParameters)
    }

    return http200WithJSONBody(JSON.stringify(resultObj))
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify({}))
}
