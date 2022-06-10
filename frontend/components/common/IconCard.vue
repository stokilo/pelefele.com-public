<template>
  <div class='icon-row-item'>
    <b-card class='mb-4 text-center'>
      <b-icon :icon='icon' font-scale='5.0' variant='primary' class='p-1' />
      <p class='card-text font-weight-semibold mb-0'>
        {{ title }}
      </p>
      <p class='lead text-center'>
        {{ value }}
      </p>
    </b-card>
  </div>
</template>
<script>
export default {
  props: {
    title: { type: String },
    icon: { type: String },
    value: { type: Number, default: 0 }
  }
}
</script>
