<template>
  <b-col :class="classes" v-bind="options">
    <slot />
  </b-col>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import Vue from 'vue'

const ColxxProps = Vue.extend({
  props: {
    xxs: String,
    xs: String,
    sm: String,
    md: String,
    lg: String,
    xl: String,
    xxl: String,
    'offset-sm': String,
    'offset-md': String,
    'offset-lg': String,
    'offset-xl': String,
    'order-sm': String,
    'order-md': String,
    'order-lg': String,
    'order-xl': String,
    tag: String,
    col: String,
    cols: String,
    offset: String,
    order: String,
    'align-self': String,
    'offset-xxs': String,
    'offset-xxl': String,
    'order-xxs': String,
    'order-xxl': String
  }
})

@Component
export default class Colxx extends ColxxProps {
  options: Object = {};
  classes: Object = {};

  mounted () {
    let cols = {}
    let customClass = {}

    for (const p in this.$props) {
      if (this.$props[p]) {
        if (p === 'xxs' || p === 'cols') {
          customClass = { ...customClass, ['col-' + this.$props[p]]: true }
        } else if (p === 'xs') {
          customClass = { ...customClass, ['col-xs-' + this.$props[p]]: true }
        } else if (p === 'xxl') {
          customClass = { ...customClass, ['col-xxl-' + this.$props[p]]: true }
        } else if (p === 'offsetXxs') {
          customClass = { ...customClass, ['offset-' + this.$props[p]]: true }
        } else if (p === 'offsetXxl') {
          customClass = { ...customClass, ['offset-xxl-' + this.$props[p]]: true }
        } else if (p === 'orderXxs') {
          customClass = { ...customClass, ['order-' + this.$props[p]]: true }
        } else if (p === 'orderXxl') {
          customClass = { ...customClass, ['order-xxl-' + this.$props[p]]: true }
        } else {
          cols = { ...cols, [p]: this.$props[p] }
        }
      }
    }
    this.options = { ...cols }
    this.classes = { ...customClass }
  }
}

</script>
