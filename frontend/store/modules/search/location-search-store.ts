import { createModule, action, mutation } from 'vuex-class-component'
import { ROUTE_NAMES } from '@backend/routes'
import {
  LocationSearchResult,
  LocationSearchResults,
  LocationSearchResultsSchema
} from '@backend/listing/search'
import ApiCall from '~/store/api/api-call'

export const VuexModule = createModule({
  namespaced: 'locationSearch',
  strict: false,
  target: 'nuxt'
})

export class LocationSearchStore extends VuexModule {
  apiCall: ApiCall = new ApiCall()
  locationData: Array<LocationSearchResult> = []
  isFetching: boolean = false

  @mutation mutateLocationData (mutatedData: Array<LocationSearchResult>) {
    this.locationData = mutatedData
  }

  @action
  async onSearch (term: string) {
    if (process.env.isMockMode) {
      return this.mutateLocationData([
        { pk: '950960-979', sk: '950960-979', location: 'małopolskie Kraków podgórze Kraka' }
      ])
    }
    const res = await this.apiCall.$get<LocationSearchResults, typeof LocationSearchResultsSchema>(
      ROUTE_NAMES.SEARCH, LocationSearchResultsSchema, { term, index: 'address' })
    if (res && res.locations) {
      await this.mutateLocationData(res.locations)
    }
  }
}
