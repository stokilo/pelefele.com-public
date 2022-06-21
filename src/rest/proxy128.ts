import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { logger } from 'common/logger'
import { http200WithJSONBody } from 'rest'
import { S3Service } from 'service/s3-service'
import { toRequestContext } from 'common/request-context'
import { ListingSchema } from 'shared/listing/listing'
import { ListingService } from 'service/listing-service'
import { isRoute, ROUTE_NAMES } from 'shared/routes'

const s3Service = new S3Service()
const listingService = new ListingService()

/**
 * This is a proxy lambda for accessing for low resource config (128MB memory).
 * In order to save deployment time and resources we share lambda with similar memory/cpu requirements.
 * These lambdas require an authenticated user.
 * @param event
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
) => {
  let resultObj = {}
  try {
    const requestContext = toRequestContext(event)
    if (event.requestContext.httpMethod === 'POST') {
      if (event.body) {
        if (isRoute(event, ROUTE_NAMES.LISTINGS)) {
          resultObj = await listingService.onListingSave(
            ListingSchema.parse(JSON.parse(event.body)),
            requestContext
          )
        }
      }
    } else if (event.requestContext.httpMethod === 'GET') {
      if (isRoute(event, ROUTE_NAMES.S3_SIGNED_URLS)) {
        resultObj = await s3Service.generatePreSignedUrl(event, requestContext)
      } else if (isRoute(event, ROUTE_NAMES.LISTINGS)) {
        resultObj = await listingService.fetchListings(requestContext)
      }
    }
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify(resultObj))
}
