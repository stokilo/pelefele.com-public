import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda/trigger/dynamodb-stream'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { AttributeValue } from '@aws-sdk/client-dynamodb'
import EsIndexOps from '../service/es/index-ops'
import { LISTINGS_INDEX_PROPS } from '../service/es'
import { ListingSchema } from '../shared/listing/listing'
import { EntityType } from '../model'

/**
 * Listen on new listing creation. Copy database record to es instance listing index.
 * @param event
 */
export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  for (const dynamoDBRecord of event.Records) {
    const streamRecord = dynamoDBRecord.dynamodb!

    if (dynamoDBRecord.eventName === 'INSERT') {
      const keys = streamRecord?.Keys!
      if (keys && keys.pk) {
        const pk = keys.pk.S as string

        if (pk.startsWith(EntityType.LISTING)) {
          const newImageDynamoDbFormat = streamRecord?.NewImage! as unknown as
            { [key: string]: AttributeValue }
          const newImageJsonFormat = unmarshall(newImageDynamoDbFormat)

          if (newImageJsonFormat.data) {
            const listing = ListingSchema.parse(newImageJsonFormat.data)
            const esIndexOps = new EsIndexOps()
            await esIndexOps.index(listing, LISTINGS_INDEX_PROPS)
          }
        }
      }
    }
  }
}
