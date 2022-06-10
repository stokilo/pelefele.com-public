<template>
  <picture>
    <source :srcSet='require(`~/assets/img/${this.src}?webp`)' type='image/webp'>
    <source :srcSet='require(`~/assets/img/${this.src}`)' type='image/jpeg'>
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

const ImageTagProps = Vue.extend({
  props: {
    src: String,
    className: String,
    alt: String
  }
})

@Component
export default class ImageTag extends ImageTagProps {
}

</script>
