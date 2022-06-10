<template>
  <picture>

    <source :srcSet='this.getWebPSrcSet' type='image/webp'>
    <source :srcSet='this.getJpegSrcSet' type='image/jpeg'>

    <img
      :src='this.getJpegSrc'
      :class='this.className'
      :alt='this.alt'
    >
  </picture>
</template>

<script lang='ts'>
import Component from 'vue-class-component'
import Vue from 'vue'

const ResizeImageTagProps = Vue.extend({
  props: {
    resizeTo: { type: String, default: '960' },
    src: String,
    className: String,
    alt: String
  }
})

@Component
export default class ResizeImageTag extends ResizeImageTagProps {
  webp_320 = require(`~/assets/img/${this.src}?resize&size=320&format=webp`)
  webp_640 = require(`~/assets/img/${this.src}?resize&size=640&format=webp`)
  webp_960 = require(`~/assets/img/${this.src}?resize&size=960&format=webp`)
  webp_1200 = require(`~/assets/img/${this.src}?resize&size=1200&format=webp`)
  webp_1800 = require(`~/assets/img/${this.src}?resize&size=1800&format=webp`)
  webp_2400 = require(`~/assets/img/${this.src}?resize&size=2400&format=webp`)

  jpeg_320 = require(`~/assets/img/${this.src}?resize&size=320`)
  jpeg_640 = require(`~/assets/img/${this.src}?resize&size=640`)
  jpeg_960 = require(`~/assets/img/${this.src}?resize&size=960`)
  jpeg_1200 = require(`~/assets/img/${this.src}?resize&size=1200`)
  jpeg_1800 = require(`~/assets/img/${this.src}?resize&size=1800`)
  jpeg_2400 = require(`~/assets/img/${this.src}?resize&size=2400`)

  get getWebPSrcSet() {
    if (this.resizeTo === '320') {
      return this.webp_320.srcSet
    } else if (this.resizeTo === '640') {
      return this.webp_640.srcSet
    } else if (this.resizeTo === '960') {
      return this.webp_960.srcSet
    } else if (this.resizeTo === '1200') {
      return this.webp_1200.srcSet
    } else if (this.resizeTo === '1800') {
      return this.webp_1800.srcSet
    } else if (this.resizeTo === '2400') {
      return this.webp_2400.srcSet
    }
    return this.webp_320.srcSet
  }

  get getJpegSrcSet() {
    if (this.resizeTo === '320') {
      return this.jpeg_320.srcSet
    } else if (this.resizeTo === '640') {
      return this.jpeg_640.srcSet
    } else if (this.resizeTo === '960') {
      return this.jpeg_960.srcSet
    } else if (this.resizeTo === '1200') {
      return this.jpeg_1200.srcSet
    } else if (this.resizeTo === '1800') {
      return this.jpeg_1800.srcSet
    } else if (this.resizeTo === '2400') {
      return this.jpeg_2400.srcSet
    }
    return this.jpeg_320.srcSet
  }

  get getJpegSrc() {
    if (this.resizeTo === '320') {
      return this.jpeg_320.srcSet
    } else if (this.resizeTo === '640') {
      return this.jpeg_640.srcSet
    } else if (this.resizeTo === '960') {
      return this.jpeg_960.srcSet
    } else if (this.resizeTo === '1200') {
      return this.jpeg_1200.srcSet
    } else if (this.resizeTo === '1800') {
      return this.jpeg_1800.srcSet
    } else if (this.resizeTo === '2400') {
      return this.jpeg_2400.srcSet
    }
    return this.jpeg_320.src
  }

  get getMedia() {
    if (this.resizeTo === '320') {
      return '(max-width: 320px)'
    } else if (this.resizeTo === '640') {
      return '(max-width: 640px)'
    } else if (this.resizeTo === '960') {
      return '(max-width: 960px)'
    } else if (this.resizeTo === '1200') {
      return '(max-width: 1200px)'
    } else if (this.resizeTo === '1800') {
      return '(max-width: 1800px)'
    } else if (this.resizeTo === '2400') {
      return '(max-width: 2400px)'
    }
    return '(max-width: 320px)'
  }
}

</script>
