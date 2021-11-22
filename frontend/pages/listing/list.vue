<template>
  <div>
    <client-only>
      <ListListings />
    </client-only>
  </div>
</template>

<script>

import { $token } from '@/utils/api'
import ListListings from '@/components/listing/ListListings'

export default {
  components: {
    ListListings
  },
  created () {
    if (process.browser) {
      window.onbeforeunload = function () {
        sessionStorage.setItem('authToken', $token.getJwt())
        sessionStorage.setItem('refreshToken', $token.getRefreshToken())
      }
    }
  }
}

</script>
