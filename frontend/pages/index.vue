<template>
  <section class='section is-small'>
    <h1 class='title'>
      pelefele.com (dev)
    </h1>
    <h2 class='subtitle'>
      Find your dream <strong>home</strong>
    </h2>

    <b-image
      :src="require('@/assets/img/home.jpg')"
      alt='pelefele.com - find your new home'
      ratio='601by235'
    />
  </section>
</template>

<script lang='ts'>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({})
export default class AuthPage extends Vue {
}

</script>
