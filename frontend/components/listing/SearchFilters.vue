<template>
  <div class="box search-box columns is-multiline is-variable is-1-mobile is-1-tablet is-1-desktop is-1-widescreen is-1-fullhd">
    <div v-for="(listingType, index) in listingTypes" :key="index" class="column is-one-quarter">
      <b-radio-button
        v-model="listingSearch.listingType"
        :native-value="listingType.id"
        type="is-primary is-light is-outlined"
        class="filter-radio-button-label"
      >
        <b-icon icon="check" />
        <span>{{ listingType.value }}</span>
      </b-radio-button>
    </div>

    <div v-for="(listingTarget, index) in listingTargets" :key="'target' + index" class="column is-one-quarter">
      <b-radio-button
        v-model="listingSearch.listingTarget"
        :native-value="listingTarget.id"
        type="is-primary is-light is-outlined"
        class="filter-radio-button-label"
      >
        {{ listingTarget.value }}
      </b-radio-button>
    </div>

    <b-field class="column is-one-quarter">
      <b-input
        v-model="listingSearch.minPrice"
        placeholder="Price from"
        type="number"
      />
    </b-field>

    <b-field class="column is-one-quarter">
      <b-input
        v-model="listingSearch.maxPrice"
        placeholder="Price to"
        type="number"
      />
    </b-field>

    <b-field class="column is-one-quarter">
      <b-input
        v-model="listingSearch.minArea"
        placeholder="Area from"
        type="number"
      />
    </b-field>

    <b-field class="column is-one-quarter">
      <b-input
        v-model="listingSearch.maxArea"
        placeholder="Area to"
        type="number"
      />
    </b-field>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { ListingSelect } from '@backend/listing/listing'
import { ListingSearch } from '@backend/listing/search'
@Component
export default class SearchFilters extends Vue {
  @Prop({ required: true }) readonly listingSearch!: ListingSearch
  @Prop({ required: true }) readonly listingTypes!: Array<ListingSelect>
  @Prop({ required: true }) readonly listingTargets!: Array<ListingSelect>
}
</script>
