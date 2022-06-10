import { Auth } from '@aws-amplify/auth'
import { NuxtJsRouteHelper } from '~/store/api/routes'
import { $log } from '~/utils/api'

/**
 * Redirects to login page if valid JWT is not found in memory or JWT is expired
 * @param redirect
 * @param route
 */
export default async function ({ redirect, route }) {
  if (NuxtJsRouteHelper.isLogoutRoute(route.name)) {
    redirect(NuxtJsRouteHelper.getIndexRoute())
  }

  let isAuth = false
  try {
    isAuth = await Auth.currentAuthenticatedUser()
  } catch (err) {
    $log.error(err)
  }

  if (!isAuth && !NuxtJsRouteHelper.isUnauthenticatedRoute(route.name)) {
    redirect(NuxtJsRouteHelper.getDefaultRedirectRoute())
  }
}
