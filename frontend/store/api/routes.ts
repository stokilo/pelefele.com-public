/**
 * API routes
 */
export class NuxtJsRouteHelper {
  /**
   * Check if nuxtjs route provided as argument can be accessed without valid auth tokens
   * @param nuxtRouteName this is nuxt route name generated from pages/ folder structure
   */
  static isUnauthenticatedRoute(nuxtRouteName: string): boolean {
    return (
      nuxtRouteName === this.getIndexRoute() ||
      nuxtRouteName === 'not-found' ||
      nuxtRouteName === 'index' ||
      nuxtRouteName === 'test'
    )
  }

  static isLogoutRoute(route: string): boolean {
    return route === 'logout'
  }

  /**
   * return main page route
   */
  static getIndexRoute(): string {
    return '/'
  }

  /**
   * return route that user should see in case something went wrong
   */
  static getDefaultRedirectRoute(): string {
    return '/'
  }

  /**
   * return route for the app that requires authenticated access
   */
  static getDefaultAppRoute(): string {
    return '/listing/search'
  }

  /**
   * Axios call to AWS URL i.e. S3 upload
   * @param routePath
   */
  static isAwsDirectCall(routePath: string = ''): boolean {
    return routePath.includes('.amazonaws.com')
  }
}
