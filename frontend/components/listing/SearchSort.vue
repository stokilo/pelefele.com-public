<template>
  <b-dropdown
    aria-role='list'
    @change='onChange'
  >
    <template #trigger='{ active }'>
      <b-button
        label='Sort by:'
        type='is-primary is-small'
        :icon-right="active ? 'chevron-up' : 'chevron-down'"
      />
    </template>

    <b-dropdown-item
      v-for='(listingSort, index) in listingSorts'
      :key="'sort' + index"
      :value='listingSort.id'
      aria-role='list-item'
    >
      {{ listingSort.value }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script lang='ts'>
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import { ListingSelect } from '@backend/listing/listing'
import { ListingSearch } from '@backend/listing/search'

@Component
export default class SearchSort extends Vue {
  @Prop({ required: true }) readonly listingSorts!: Array<ListingSelect>
  @Prop({ required: true }) readonly listingSearch!: ListingSearch

  onChange(event: any) {
    this.listingSearch.listingSort = event
    this.$emit('onSortChange')
  }
}
</script>
