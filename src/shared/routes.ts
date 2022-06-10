import { APIGatewayProxyEvent } from 'aws-lambda'

/**
 * Available routes
 */

export const ADMIN_ROUTES = {
  ADMIN_DUMMY: 'admin/dummy',
  ADMIN_PANEL: 'admin/panel',
}

export const UNAUTHENTICATED_ROUTE_NAMES = {} as const

export const ROUTE_NAMES = {
  ...ADMIN_ROUTES,
  ...UNAUTHENTICATED_ROUTE_NAMES,

  S3_SIGNED_URLS: 's3-signed-urls',
  LISTINGS: 'listings',
  SEARCH: 'search',
} as const

export const ROUTES = {
  GET_ADMIN_DUMMY: `GET /${ROUTE_NAMES.ADMIN_DUMMY}`,
  GET_ADMIN_PANEL: `GET /${ROUTE_NAMES.ADMIN_PANEL}`,

  GET_S3_SIGNED_URL: `GET /${ROUTE_NAMES.S3_SIGNED_URLS}`,

  POST_LISTING: `POST /${ROUTE_NAMES.LISTINGS}`,
  GET_LISTING: `GET /${ROUTE_NAMES.LISTINGS}/{id}`,
  GET_LISTINGS: `GET /${ROUTE_NAMES.LISTINGS}`,

  GET_SEARCH: `GET /${ROUTE_NAMES.SEARCH}`,
} as const

export function isRoute(
  event: APIGatewayProxyEvent,
  routeName: string
): boolean {
  return event.resource === `/${routeName}`
}
