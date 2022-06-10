<template>
  <div>
    <div id='app'>
      <section class='hero is-light' :class="{ 'is-fullheight': !showFiltersMode }">
        <div class='hero-body p-b-30 '>
          <div class='container'>
            <section v-if='listingStore.listings.length'>
              <b-table
                class='pt-2 pl-2 pr-2 pb-2'
                :data='listingStore.listings'
                :narrowed='true'
                :focusable='true'
                :striped='true'
              >
                <b-table-column v-slot='props' field='title' label='Title: ' width='40' centered>
                  <nav class='level'>
                    <div class='level-item has-text-centered'>
                      <div>
                        <p class='heading'>
                          {{ props.row.title }}
                        </p>
                        <p class='title '>
                          {{ props.row.area }} m2
                        </p>
                      </div>
                    </div>
                  </nav>
                </b-table-column>

                <b-table-column v-slot='props' field='price' label='Price: ' width='40' centered>
                  <div class='level-item has-text-centered'>
                    <div>
                      <p class='heading'>
                        Asking:
                      </p>
                      <p class='title '>
                        {{ props.row.price }} USD
                      </p>
                    </div>
                  </div>
                </b-table-column>

                <b-table-column v-slot='props' field='price' label='Cover: ' width='40'>
                  <b-image class='title is-128x128' :src='props.row.coverFileName | cdnUrl' alt='' />
                </b-table-column>

                <b-table-column v-slot='props' field='edit' label=' ' width='40'>
                  <b-button class='is-primary' outlined @click.prevent='loadListing(props.row)'>
                    Show
                  </b-button>
                </b-table-column>

                <template #footer>
                  <div class='has-text-right'>
                    User listings
                  </div>
                </template>
              </b-table>

              <ListingItem :record='selectedListing' />
            </section>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue'
import Component from 'vue-class-component'
import { Listing, newListing } from '@backend/listing/listing'
import { proxy } from '~/store/store'
import { $loader } from '~/utils/api'
import { ListingStore } from '~/store/modules/listing/listing-store'
import ListingItem from '~/components/listing/ListingItem.vue'

@Component({
  components: { ListingItem }
})
export default class ListListings extends Vue {
  listingStore: ListingStore = proxy.listingStore
  selectedListing?: Listing = newListing()
  showFiltersMode: boolean = false

  async mounted() {
    const loader = $loader.show()
    await this.listingStore.loadListings()
    loader.hide()
  }

  loadListing(listing: Listing) {
    this.selectedListing = listing
  }
}
</script>
