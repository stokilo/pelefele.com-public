import { logger } from 'common/logger'
import { RequestContext } from 'common/request-context'
import {
  GetListing,
  GetListings,
  Listing,
  PostListing,
} from 'shared/listing/listing'
import { StatusNOTOK, StatusOK, ValidationOK } from 'shared/form'
import { ListingEntity } from '../model/ListingEntity'

export class ListingService {
  async getListing(pk: string, sk: string): Promise<GetListing> {
    const listingEntity = new ListingEntity()
    return {
      listing: await listingEntity.load(pk, sk),
    }
  }

  async fetchListings(requestContext: RequestContext): Promise<GetListings> {
    const listingEntity = new ListingEntity()
    return {
      listings: await listingEntity.list(requestContext.userId, {
        Limit: 5,
        ScanIndexForward: false,
      }),
    }
  }

  async onListingSave(
    listing: Listing,
    requestContext: RequestContext
  ): Promise<PostListing> {
    const response: PostListing = {
      status: StatusOK(),
      validation: ValidationOK(),
      listing,
    }

    try {
      const listingEntity = new ListingEntity()
      const { success, savedListing } = await listingEntity.save(
        listing,
        requestContext.userId
      )

      response.status = success ? StatusOK() : StatusNOTOK()
      if (success) {
        response.listing = savedListing
      }
    } catch (err) {
      logger.error(err)
      response.status.success = false
    }
    return response
  }
}
