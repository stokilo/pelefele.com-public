<template>
  <b-field>
    <b-autocomplete
      field='location'
      placeholder='Location ...'
      clearable
      size='is-large'
      icon-pack='fa'
      icon='search'
      v-bind='$attrs'
      v-on='$listeners'
    >
      <template slot-scope='props'>
        <div class='media'>
          <div class='media-content autocomplete-search-item'>
            <span class='is-size-9 is-family-secondary'>
              {{ props.option.location }}
            </span>
            <br>
          </div>
        </div>
      </template>
    </b-autocomplete>
  </b-field>
</template>

<script lang='ts'>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class SearchAutocomplete extends Vue {
}
</script>
