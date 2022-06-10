import { createModule, action, mutation } from 'vuex-class-component'
import { ROUTE_NAMES } from '@backend/routes'
import {
  ListingSearch,
  ListingsSearchResults,
  ListingsSearchResultsSchema,
  LocationSearchResult,
  newListingSearch,
} from '@backend/listing/search'
import {
  Listing,
  LISTING_SORTS,
  LISTING_TARGETS,
  LISTING_TYPES,
  ListingSelect,
  newTestListing,
  newTestListingResult,
} from '@backend/listing/listing'
import ApiCall from '~/store/api/api-call'

export const VuexModule = createModule({
  namespaced: 'listingSearch',
  strict: false,
  target: 'nuxt',
})

export class ListingSearchStore extends VuexModule {
  apiCall: ApiCall = new ApiCall()

  listingTypes: Array<ListingSelect> = LISTING_TYPES
  listingTargets: Array<ListingSelect> = LISTING_TARGETS
  listingSorts: Array<ListingSelect> = LISTING_SORTS

  listingSearch: ListingSearch = newListingSearch()
  listingsFound: Array<Listing> = []

  pagingTotalCount: Number = 0
  pagingCurrentPage = 1
  pagingPageSize = 3

  searchDuration: string = ''

  get isSearchDisabled() {
    return (
      !process.env.isDevMode &&
      (!this.listingSearch.locationPk.length ||
        !this.listingSearch.location.length)
    )
  }

  /**
   * Converts [1, 2, 3, 4, 5, 6, 7 ] to [[1, 2, 3], [4, 5, 6], [7]] but instead of numbers we have Listing instances
   */
  get listingsGroupedBy3(): Array<Array<Listing>> {
    return this.listingsFound.reduce<Array<Array<Listing>>>(function (
      previousValue: Array<Array<Listing>>,
      currentValue: Listing,
      currentIndex: number,
      array: Array<Listing>
    ) {
      if (currentValue && currentIndex % 3 === 0) {
        previousValue.push(array.slice(currentIndex, currentIndex + 3))
      }
      return previousValue
    },
    [])
  }

  @mutation resetPaging() {
    this.pagingCurrentPage = 1
    this.pagingTotalCount = 0
  }

  /**
   * Es limitation for deep paging force us to round up max result count to 10000
   */
  @mutation mutateListingData(mutatedData: ListingsSearchResults) {
    this.listingsFound = mutatedData.listings
      ? (mutatedData.listings as Array<Listing>)
      : []
    this.pagingTotalCount =
      mutatedData.totalCount > 10000 ? 1000 : mutatedData.totalCount
    this.searchDuration = mutatedData.took
  }

  @mutation
  resetLocationSearch() {
    this.listingSearch.location = ''
    this.listingSearch.locationPk = ''
    this.listingSearch.locationSk = ''
  }

  @mutation
  onLocationSelect(selectedLocation: LocationSearchResult) {
    if (selectedLocation) {
      this.listingSearch.location = selectedLocation.location
      this.listingSearch.locationPk = selectedLocation.pk
      this.listingSearch.locationSk = selectedLocation.sk
    }
  }

  @action
  async onSearch() {
    if (process.env.isMockMode) {
      return this.mutateListingData(
        newTestListingResult([newTestListing()], this.pagingCurrentPage)
      )
    }

    const res = await this.apiCall.$get<
      ListingsSearchResults,
      typeof ListingsSearchResultsSchema
    >(ROUTE_NAMES.SEARCH, ListingsSearchResultsSchema, {
      index: 'listing',
      locationPk: this.listingSearch.locationPk,
      locationSk: this.listingSearch.locationSk,
      listingTarget: this.listingSearch.listingTarget,
      listingType: this.listingSearch.listingType,
      minPrice: this.listingSearch.minPrice,
      maxPrice: this.listingSearch.maxPrice,
      minArea: this.listingSearch.minArea,
      maxArea: this.listingSearch.maxArea,
      pageSize: this.pagingPageSize,
      pageNr: this.pagingCurrentPage,
      listingSort: this.listingSearch.listingSort,
    })
    if (res) {
      await this.mutateListingData(res)
    }
  }
}
