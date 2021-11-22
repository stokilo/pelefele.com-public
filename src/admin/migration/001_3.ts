import { logger } from 'common/logger'
import { LISTINGS_INDEX_PROPS } from 'service/es'
import EsIndexOps from 'service/es/index-ops'
import {
  Listing,
  LISTING_TARGET_RENTAL,
  LISTING_TARGET_SALE, LISTING_TYPE_APARTMENT,
  LISTING_TYPE_HOUSE
} from 'shared/listing/listing'
import { MigrationJob } from '../index'
import AddressesIndexSearch from '../../service/es/indexes/addresses-search'

/**
 * Migration 003: fill listing index with random data
 */
export default class Migration001Nr3 implements MigrationJob {
  type (): string {
    return 'ES_DATA_FOR_LISTINGS_DATA'
  }

  async migrate (): Promise<boolean> {
    console.info(`Migrate ${this.type()}`)
    for (let i = 1; i <= 50; i++) {
      const res = await this.generate(1000)
      if (!res) {
        return false
      }
    }
    return true
  }

  async generate (count: number): Promise<boolean> {
    logger.info('Listing data generation')
    const batchArr = []
    const esIndexOps = new EsIndexOps()
    const addressesIndexSearch = new AddressesIndexSearch()
    const term = this.randomString()
    const randomAddress = await addressesIndexSearch.search({ term })
    let pk = ''
    let sk = ''
    let location = ''
    if (randomAddress.locations && randomAddress.locations.length) {
      const address = randomAddress.locations[0]
      location = address.location
      pk = address.pk
      sk = address.sk
    }

    for (let i = 0; i <= count; i++) {
      const randomArea = Math.floor(Math.random() * 600)
      const randomPrice = Math.floor(Math.random() * 10000000)
      const is1 = Math.random() * 10 <= 5
      const is2 = Math.random() * 10 <= 5

      const listingDoc: Listing = {
        pk,
        sk,
        title: `Title: ${location}`,
        type: is1 ? LISTING_TYPE_HOUSE.id : LISTING_TYPE_APARTMENT.id,
        target: is2 ? LISTING_TARGET_SALE.id : LISTING_TARGET_RENTAL.id,
        area: randomArea.toString(),
        price: randomPrice.toString(),
        location,
        locationPk: pk,
        locationSk: sk,
        coverFileName: 'cover.jpeg',
        listingFileNames: ['1.jpeg']
      }
      batchArr.push(
        listingDoc
      )
    }

    try {
      await esIndexOps.bulkInsert(batchArr, LISTINGS_INDEX_PROPS)
    } catch (e) {
      logger.error(e)
      return false
    }
    return true
  }

  randomString () {
    const r = Math.floor(Math.random() * 11)
    return ['kra', 'war', 'siemie', 'grom', 'wiel', 'boch', 'brzes', 'tar', 'bor', 'pad', 'mad'][r]
  }
}
