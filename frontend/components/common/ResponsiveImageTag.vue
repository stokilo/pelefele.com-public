<template>
  <picture>
    <source media='(max-width: 320px)' :srcSet='this.webp320.srcSet' type='image/webp'>
    <source media='(max-width: 640px)' :srcSet='this.webp640.srcSet' type='image/webp'>
    <source media='(max-width: 960px)' :srcSet='this.webp960.srcSet' type='image/webp'>
    <source media='(max-width: 1200px)' :srcSet='this.webp1200.srcSet' type='image/webp'>
    <source media='(max-width: 1800px)' :srcSet='this.webp1800.srcSet' type='image/webp'>
    <source media='(max-width: 2400px)' :srcSet='this.webp2400.srcSet' type='image/webp'>

    <source media='(max-width: 320px)' :srcSet='this.jpeg320.srcSet' type='image/jpeg'>
    <source media='(max-width: 640px)' :srcSet='this.jpeg640.srcSet' type='image/jpeg'>
    <source media='(max-width: 960px)' :srcSet='this.jpeg960.srcSet' type='image/jpeg'>
    <source media='(max-width: 1200px)' :srcSet='this.jpeg1200.srcSet' type='image/jpeg'>
    <source media='(max-width: 1800px)' :srcSet='this.jpeg1800.srcSet' type='image/jpeg'>
    <source media='(max-width: 2400px)' :srcSet='this.jpeg2400.srcSet' type='image/jpeg'>

    <img
      :src='require(`~/assets/img/${this.src}`)'
      :class='this.className'
      :alt='this.alt'
      :style='{ backgroundColor: require(`~/assets/img/${this.src}?lqip-colors`)[0] }'
    >
  </picture>
</template>

<script lang='ts'>
import Component from 'vue-class-component'
import Vue from 'vue'

const ResponsiveImageTagProps = Vue.extend({
  props: {
    src: String,
    className: String,
    alt: String
  }
})

@Component
export default class ResponsiveImageTag extends ResponsiveImageTagProps {
  webp320 = require(`~/assets/img/${this.src}?resize&size=320&format=webp`)
  webp640 = require(`~/assets/img/${this.src}?resize&size=640&format=webp`)
  webp960 = require(`~/assets/img/${this.src}?resize&size=960&format=webp`)
  webp1200 = require(`~/assets/img/${this.src}?resize&size=1200&format=webp`)
  webp1800 = require(`~/assets/img/${this.src}?resize&size=1800&format=webp`)
  webp2400 = require(`~/assets/img/${this.src}?resize&size=2400&format=webp`)

  jpeg320 = require(`~/assets/img/${this.src}?resize&size=320`)
  jpeg640 = require(`~/assets/img/${this.src}?resize&size=640`)
  jpeg960 = require(`~/assets/img/${this.src}?resize&size=960`)
  jpeg1200 = require(`~/assets/img/${this.src}?resize&size=1200`)
  jpeg1800 = require(`~/assets/img/${this.src}?resize&size=1800`)
  jpeg2400 = require(`~/assets/img/${this.src}?resize&size=2400`)
}

</script>
