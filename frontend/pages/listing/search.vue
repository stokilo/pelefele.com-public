<template>
  <div>
    <SearchListings />
  </div>
</template>

<script>

import { $token } from '@/utils/api'
import SearchListings from '@/components/listing/SearchListings'

export default {
  components: {
    SearchListings
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
