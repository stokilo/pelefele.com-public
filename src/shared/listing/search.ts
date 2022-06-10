import * as zod from 'zod'
import {
  LISTING_TARGET_SALE,
  LISTING_TYPE_APARTMENT,
  ListingSchema,
  ListingSelectSchema,
} from './listing'

export const ListingSearchSchema = zod.object({
  location: zod.string(),
  locationPk: zod.string(),
  locationSk: zod.string(),
  listingType: zod.optional(ListingSelectSchema),
  listingTarget: zod.optional(ListingSelectSchema),
  minPrice: zod.optional(zod.string()),
  maxPrice: zod.optional(zod.string()),
  minArea: zod.optional(zod.string()),
  maxArea: zod.optional(zod.string()),
  listingSort: zod.optional(zod.string()),
})

export const LocationSearchResultSchema = zod.object({
  pk: zod.string(),
  sk: zod.string(),
  location: zod.string(),
})

export const LocationSearchResultsSchema = zod.object({
  locations: zod.optional(zod.array(LocationSearchResultSchema)),
})

export const ListingsSearchResultsSchema = zod.object({
  listings: zod.optional(zod.array(ListingSchema)),
  totalCount: zod.number(),
  took: zod.string(),
})

export type ListingSearch = zod.TypeOf<typeof ListingSearchSchema>
export type LocationSearchResult = zod.TypeOf<typeof LocationSearchResultSchema>
export type LocationSearchResults = zod.TypeOf<
  typeof LocationSearchResultsSchema
>
export type ListingsSearchResults = zod.TypeOf<
  typeof ListingsSearchResultsSchema
>

export const newListingSearch = (): ListingSearch => {
  return {
    listingType: LISTING_TYPE_APARTMENT,
    listingTarget: LISTING_TARGET_SALE,
    location: '',
    locationPk: '',
    locationSk: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    listingSort: '',
  }
}
