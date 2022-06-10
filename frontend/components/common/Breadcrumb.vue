<template>
  <span>
    <h1 v-if='heading && heading.length>0'>{{ heading }}</h1>
    <b-nav class='pt-0 breadcrumb-container d-none d-sm-block d-lg-inline-block'>
      <b-breadcrumb :items='items' />
    </b-nav>
  </span>
</template>

<script lang='ts'>
import Component from 'vue-class-component'
import Vue from 'vue'

const BreadcrumbProps = Vue.extend({
  props: {
    heading: String
  }
})

@Component
export default class Breadcrumb extends BreadcrumbProps {
  items: Array<Object> = []

  mounted() {
    const path = this.$route.path.substr(1)
    let rawPaths = path.split('/')

    for (const pName in this.$route.params) {
      if (rawPaths.includes(this.$route.params[pName])) {
        rawPaths = rawPaths.filter(x => x !== this.$route.params[pName])
      }
    }
    rawPaths.map((sub: string) => {
      this.items.push({
        text:
          '/' + this.$t('piaf.menu-home'),
        to: this.getUrl(path, sub)
      })
    })
  }

  getUrl(path: string, sub: string) {
    return '/' + path.split(sub)[0] + sub
  }
}

</script>
