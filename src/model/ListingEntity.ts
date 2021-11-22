import KSUID from 'ksuid'
import { QueryCommandInput } from '@aws-sdk/lib-dynamodb/dist-types/ts3.4'
import { AttributeValue, QueryCommandOutput } from '@aws-sdk/client-dynamodb'
import { Listing } from '../shared/listing/listing'
import { BaseEntity } from './BaseEntity'
import { EntityType, newEntityObjectWithPkSk } from './index'

export class ListingEntity extends BaseEntity<Listing> {
  async save (listing: Listing, userId: string): Promise<{success: boolean, savedListing: Listing}> {
    const listingToSave = JSON.parse(JSON.stringify(listing))
    const currentDate = new Date()
    listingToSave.pk = `${EntityType.LISTING}#${userId}`
    listingToSave.sk = `${EntityType.LISTING}#${(await KSUID.random()).string}`

    const entity = newEntityObjectWithPkSk(listingToSave)
    entity.gsi1pk = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`
    entity.gsi1sk = (await KSUID.random()).string

    return {
      success: await super.put({
        ...super.withTable(),
        ...super.withEntityObject(entity)
      }),
      savedListing: listingToSave
    }
  }

  async load (pk: string, sk: string): Promise<Listing | undefined> {
    const queryCommand: QueryCommandInput = {
      ...super.withTable(),
      KeyConditionExpression: '#pk = :pk_val and #sk = :sk_val',
      ExpressionAttributeNames: {
        '#pk': 'pk',
        '#sk': 'sk'
      },
      ExpressionAttributeValues: {
        ':pk_val': pk,
        ':sk_val': sk
      }
    }

    const maybeResult = await super.singleResultOrError(queryCommand)
    return maybeResult.found ? maybeResult.data : undefined
  }

  async loadGSI (forDate: Date, exclusiveStartKey: { [key: string]: AttributeValue; } | undefined):
    Promise<QueryCommandOutput> {
    const queryCommand: QueryCommandInput = {
      ...super.withTable(),
      ...super.withReturnTotalCapacity(),
      IndexName: 'gsi1',
      KeyConditionExpression: '#gsi1pk = :gsi1pk_val',
      ExpressionAttributeNames: {
        '#gsi1pk': 'gsi1pk'
      },
      ExpressionAttributeValues: {
        ':gsi1pk_val': `${forDate.getFullYear()}-${forDate.getMonth()}-${forDate.getDate()}`
      }
    }
    if (exclusiveStartKey) {
      queryCommand.ExclusiveStartKey = {
        gsi1pk: exclusiveStartKey
      }
    }

    return await this.documentClient.query(queryCommand)
  }

  async list (userId: string, params: any = {}): Promise<Listing[]> {
    const queryCommand: QueryCommandInput = {
      ...super.withTable(),
      KeyConditionExpression: '#pk = :pk_val',
      ExpressionAttributeNames: {
        '#pk': 'pk'
      },
      ExpressionAttributeValues: {
        ':pk_val': `${EntityType.LISTING}#${userId}`
      },
      Limit: 10,
      ...params
    }

    return await super.multipleResults(queryCommand)
  }
}
