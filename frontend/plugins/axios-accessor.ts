import { Plugin } from '@nuxt/types'
// import { UNAUTHENTICATED_ROUTE_NAMES } from '@backend/routes'
import { initializeAxios, $token } from '~/utils/api'
// import { NuxtJsRouteHelper } from '~/store/api/routes'

const accessor: Plugin = (context) => {
  initializeAxios(context.$axios)

  // let refreshRequestCount: number = 0

  // Keep refresh token claim 'exp' two times longer than session token
  // Call refresh token to get new short lived jwt, do it before request itself, do it only when jwt is expired
  // Keep request count around to avoid infinite loop
  // context.$axios.interceptors.request.use(
  //   async (config) => {
  //     if (
  //       config.url &&
  //       config.method !== 'options' &&
  //       !(config.url in UNAUTHENTICATED_ROUTE_NAMES) &&
  //       !$token.hasValidJwtToken() &&
  //       $token.getJwt().length &&
  //       refreshRequestCount < 10) {
  //       refreshRequestCount++
  //       const tokenRefreshed: boolean = await $token.callRefreshTokenEndPoint()
  //
  //       if (!tokenRefreshed) {
  //         await context.redirect(NuxtJsRouteHelper.getDefaultRedirectRoute())
  //         await Promise.reject(new Error('Unauthenticated error'))
  //       }
  //     }
  //
  //     if ($token.getJwt()) {
  //       if (!NuxtJsRouteHelper.isAwsDirectCall(config.url)) {
  //         config.headers.Authorization = $token.getJwt()
  //       }
  //     }
  //     return await config
  //   },
  //   async (error) => {
  //     await Promise.reject(error)
  //   })
}

export default accessor
