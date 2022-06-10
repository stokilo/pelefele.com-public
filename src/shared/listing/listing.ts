import * as zod from 'zod'
import { FormSchema } from '../form'
import { ListingsSearchResults } from './search'

export const ListingSelectSchema = zod.object({
  id: zod.string(),
  value: zod.string(),
})

export const ListingSchema = zod.object({
  pk: zod.string(),
  sk: zod.string(),
  title: zod.string().min(5).max(255),
  location: zod.string(),
  locationPk: zod.string(),
  locationSk: zod.string(),
  type: zod.string(),
  target: zod.string(),
  area: zod.string().optional(),
  price: zod.string().optional(),
  coverFileName: zod.string().optional(),
  listingFileNames: zod.array(zod.string()).optional(),
})

export const PostListingSchema = FormSchema.extend({
  listing: zod.optional(ListingSchema),
})

export const GetListingSchema = zod.object({
  listing: zod.optional(ListingSchema),
})

export const GetListingsSchema = zod.object({
  listings: zod.array(ListingSchema),
})

export type ListingSelect = zod.TypeOf<typeof ListingSelectSchema>
export type Listing = zod.TypeOf<typeof ListingSchema>
export type GetListing = zod.TypeOf<typeof GetListingSchema>
export type GetListings = zod.TypeOf<typeof GetListingsSchema>
export type PostListing = zod.TypeOf<typeof PostListingSchema>

export const LISTING_TYPE_APARTMENT = { id: '1', value: 'Apartment' }
export const LISTING_TYPE_HOUSE = { id: '2', value: 'House' }
export const LISTING_TYPES: Array<ListingSelect> = [
  LISTING_TYPE_APARTMENT,
  LISTING_TYPE_HOUSE,
]

export const LISTING_TARGET_SALE = { id: '1', value: 'Sale' }
export const LISTING_TARGET_RENTAL = { id: '2', value: 'Rental' }
export const LISTING_TARGETS: Array<ListingSelect> = [
  LISTING_TARGET_SALE,
  LISTING_TARGET_RENTAL,
]

export const LISTING_SORT_PRICE_ASC = {
  id: '1',
  value: 'Price from low to high',
}
export const LISTING_SORT_PRICE_DESC = {
  id: '2',
  value: 'Price from high to low',
}
export const LISTING_SORT_AREA_ASC = { id: '3', value: 'Area from low to high' }
export const LISTING_SORT_AREA_DESC = {
  id: '4',
  value: 'Area from high to low',
}
export const LISTING_SORTS: Array<ListingSelect> = [
  LISTING_SORT_PRICE_ASC,
  LISTING_SORT_PRICE_DESC,
  LISTING_SORT_AREA_ASC,
  LISTING_SORT_AREA_DESC,
]

export const sort2Es = (id: string) => {
  if (id === LISTING_SORT_PRICE_ASC.id) {
    return { price: 'asc' }
  } else if (id === LISTING_SORT_PRICE_DESC.id) {
    return { price: 'desc' }
  } else if (id === LISTING_SORT_AREA_ASC.id) {
    return { area: 'asc' }
  } else if (id === LISTING_SORT_AREA_DESC.id) {
    return { area: 'desc' }
  }

  return {}
}

export const newListing = (): Listing => {
  return {
    pk: '',
    sk: '',
    title: '',
    location: '',
    locationPk: '',
    locationSk: '',
    type: '1',
    target: '1',
  }
}

export const newTestListing = (): Listing => {
  return {
    pk: '1',
    sk: '1',
    target: '1',
    type: '1',
    price: '100',
    area: '200',
    title: 'Krakow Zwierzyniecka',
    location: 'małopolskie Kraków podgórze Kraka',
    locationPk: '950960-9791',
    locationSk: '950960-9791',
    listingFileNames: [],
    coverFileName: '2021/10/7/b514595e-670e-4bd2-9731-72d2820bed7b',
  }
}

export const newTestListingResult = (
  listings: Array<Listing>,
  currentPage: number
): ListingsSearchResults => {
  return {
    took: '0',
    totalCount: 4,
    listings:
      currentPage === 1
        ? listings.flatMap((i) => [i, i, i])
        : listings.flatMap((i) => [i]),
  }
}
