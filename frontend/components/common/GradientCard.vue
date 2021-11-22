<template>
  <b-card class="progress-banner" no-body>
    <b-card-body class="justify-content-between d-flex flex-row align-items-center">
      <div>
        <i :class="`${icon} mr-2 text-white align-text-bottom d-inline-block`" />
        <div>
          <p class="lead text-white">
            {{ title }}
          </p>
          <p class="text-small text-white">
            {{ detail }}
          </p>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  props: ['icon', 'title', 'detail']
}
</script>
