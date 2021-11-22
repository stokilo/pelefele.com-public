<template>
  <div>
    <div id="app">
      <section class="hero is-light" :class="{ 'is-fullheight': !showFiltersMode }">
        <div class="hero-body  p-b-30 ">
          <div class="container">
            <h2 v-if="!showFiltersMode" class="subtitle">
              <span class="has-text-centered is-block">
                Search hundreds of thousands of apartments, condos and houses.
              </span>
            </h2>
            <h1 v-if="!showFiltersMode" class="title">
              <span class="is-size-2 has-text-centered is-block">Find A Place You’ll Love.</span>
            </h1>
            <div class="columns is-centered">
              <div class="column is-7">
                <div class="search-form">
                  <form>
                    <div class="field has-addons has-shadow-field">
                      <div class="control has-icons-left is-expanded">
                        <SearchAutocomplete
                          v-model="listingSearchStore.listingSearch.location"
                          :data="locationSearchStore.locationData"
                          :loading="locationSearchStore.isFetching"
                          @focus="showFiltersMode=true"
                          @typing="onLocationSearch"
                          @select="listingSearchStore.onLocationSelect"
                        />
                      </div>
                      <div class="control">
                        <button
                          type="button"
                          class="button is-large is-primary"
                          :disabled="listingSearchStore.isSearchDisabled"
                          @click="onListingSearchSubmit"
                        >
                          <span class="has-text-weight-semibold">Go!</span>
                        </button>
                      </div>
                    </div>

                    <SearchFilters
                      v-if="showFiltersMode"
                      :listing-search="listingSearchStore.listingSearch"
                      :listing-types="listingSearchStore.listingTypes"
                      :listing-targets="listingSearchStore.listingTargets"
                    />

                    <SearchSort
                      v-if="showSearchResultsMode"
                      :listing-sorts="listingSearchStore.listingSorts"
                      :listing-search="listingSearchStore.listingSearch"
                      @onSortChange="onListingSearch"
                    />
                  </form>
                </div>
              </div>
            </div>
            <div v-if="!showSearchResultsMode" class="has-text-centered">
              <img class="m-t-50" src="~/assets/img/property_image.png" alt="Find rentals">
            </div>
          </div>
        </div>
      </section>

      <section class="hero is-medium has-text-centered">
        <div class="hero-body ">
          <div class="container">
            <h2 v-if="!showSearchResultsMode" class="subtitle">
              Find rentals in all of the major US cities.
            </h2>
            <h1 v-if="!showSearchResultsMode" class="title">
              Rental listings updated daily.
            </h1>
            <br>
            <div v-if="showSearchResultsMode" class="columns is-centered">
              <div class="column is-10">
                <div
                  v-for="(listing3, index) in listingSearchStore.listingsGroupedBy3"
                  :key="index"
                  class="columns is-multiline"
                >
                  <SearchItem
                    v-for="(listing, index2) in listing3"
                    :key="index2"
                    :main-description="listing.title"
                    :title="listing.location"
                    :price="listing.price"
                    :area="listing.area"
                    :cover-file-name="listing.coverFileName"
                  />
                </div>

                <b-pagination
                  v-if="listingSearchStore.listingsFound.length"
                  v-model="listingSearchStore.pagingCurrentPage"
                  :total="listingSearchStore.pagingTotalCount"
                  :per-page="listingSearchStore.pagingPageSize"
                  range-before="3"
                  range-after="1"
                  order="is-centered"
                  size="is-medium"
                  rounded
                  icon-prev="chevron-left"
                  icon-next="chevron-right"
                  aria-next-label="Next page"
                  aria-previous-label="Previous page"
                  aria-page-label="Page"
                  aria-current-label="Current page"
                  @change="onListingSearch"
                />
              </div>
            </div>
            <img class="m-t-50" src="~/assets/img/city_clipart.png" alt="Rental listings">
          </div>
        </div>
      </section>

      <div class="container">
        <hr>
      </div>
      <section class="hero">
        <div class="hero-body">
          <div class="container">
            <div class="columns is-centered">
              <div class="column is-7">
                <div class="columns">
                  <div class="column">
                    <h1 class="title m-t-60">
                      All marketplaces
                    </h1>
                    <h2 class="subtitle">
                      Bulma Rent provides you insights into all marketplaces.
                    </h2>
                  </div>
                  <div class="column has-text-centered">
                    <img class="m-t-50" src="~/assets/img/house_for_rent.png" alt="Rental marketplaces">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="hero is-medium is-light">
        <div class="hero-body p-b-30">
          <div class="container">
            <div class="has-text-centered">
              <h2 class="subtitle">
                For landlords & property managers
              </h2>
              <h1 class="title">
                Want to Decrease Time on Market?
              </h1>
              <p class="m-t-30">
                <a
                  href="https://github.com/aldi/awesome-bulma-templates"
                  class="button is-medium is-shadowy is-primary"
                >
                  Learn more
                </a>
              </p>
              <div class="has-text-centered m-t-60">
                <img class="m-t-50" src="~/assets/img/cartoon_city.png" alt="Find rentals">
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Debounce } from 'vue-debounce-decorator'
import { proxy } from '~/store/store'
import { $i18n, $loader, $notify } from '~/utils/api'
import SearchAutocomplete from '~/components/listing/SearchAutocomplete.vue'
import SearchItem from '~/components/listing/SearchItem.vue'
import { ListingSearchStore } from '~/store/modules/search/listing-search-store'
import { LocationSearchStore } from '~/store/modules/search/location-search-store'
import SearchSort from '~/components/listing/SearchSort.vue'
import SearchFilters from '~/components/listing/SearchFilters.vue'

@Component({
  components: { SearchSort, SearchFilters, SearchAutocomplete, SearchItem }
})
export default class SearchListings extends Vue {
  listingSearchStore: ListingSearchStore = proxy.listingSearchStore
  locationSearchStore: LocationSearchStore = proxy.locationSearchStore

  showFiltersMode: boolean = false
  showSearchResultsMode: boolean = false

  async onListingSearchSubmit () {
    this.listingSearchStore.resetPaging()
    await this.onListingSearch()
  }

  async onListingSearch () {
    const loader = $loader.show()
    try {
      await this.listingSearchStore.onSearch()
      this.showSearchResultsMode = true
    } catch (e) {
      this.$log.error(e)
      $notify('error', $i18n.t('api.error-msg-title'), $i18n.t('api.error-msg-content'))
    }
    setTimeout(() => {
      loader.hide()
    }, 400)
  }

  @Debounce(500)
  async onLocationSearch (name: string) {
    await this.locationSearchStore.onSearch(name)
  }
}
</script>
