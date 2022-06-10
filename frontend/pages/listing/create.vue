<template>
  <div>
    <client-only>
      <CreateListing />
    </client-only>
  </div>
</template>

<script>

import { $token } from '@/utils/api'
import CreateListing from '@/components/listing/CreateListing'

export default {
  components: {
    CreateListing
  },
  created() {
    if (process.browser) {
      window.onbeforeunload = function() {
        sessionStorage.setItem('authToken', $token.getJwt())
        sessionStorage.setItem('refreshToken', $token.getRefreshToken())
      }
    }
  }
}

</script>
