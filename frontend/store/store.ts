import { extractVuexModule, createProxy } from 'vuex-class-component'
import Vuex from 'vuex'
import Vue from 'vue'
import { ListingStore } from '~/store/modules/listing/listing-store'
import { LocationSearchStore } from '~/store/modules/search/location-search-store'
import { ListingSearchStore } from '~/store/modules/search/listing-search-store'

Vue.use(Vuex)

export const store = new Vuex.Store({
  modules: {
    ...extractVuexModule(LocationSearchStore),
    ...extractVuexModule(ListingSearchStore),
    ...extractVuexModule(ListingStore)
  }
})

export const proxy = {
  listingStore: createProxy(store, ListingStore),
  listingSearchStore: createProxy(store, ListingSearchStore),
  locationSearchStore: createProxy(store, LocationSearchStore)
}
