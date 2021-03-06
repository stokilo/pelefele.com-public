/* eslint-disable import/no-mutable-exports */
import { NuxtAxiosInstance } from '@nuxtjs/axios'

class Token {
  private jwt: string
  private refreshToken: string

  constructor() {
    this.jwt = ''
    this.refreshToken = ''
  }

  reset() {
    this.setJwt('')
    this.setRefreshToken('')
    sessionStorage.clear()
  }

  setJwt(jwt: string) {
    this.jwt = jwt
  }

  getJwt(): string {
    return this.jwt
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken
  }

  getRefreshToken(): string {
    return this.refreshToken
  }

  hasValidJwtToken(): boolean {
    return this.isTokenValid(this.getJwt())
  }

  hasValidRefreshToken(): boolean {
    return this.isTokenValid(this.getRefreshToken())
  }

  isTokenValid(token: string): boolean {
    if (!token || token.length <= 0) {
      return false
    }

    let isJwtExpired
    try {
      const claims = JSON.parse(atob(token.split('.')[1]))
      const exp = claims.exp
      const now = Date.now().valueOf() / 1000
      isJwtExpired = exp < now
    } catch (e) {
      isJwtExpired = true
    }
    return !isJwtExpired
  }
}

let $axios: NuxtAxiosInstance
let $token: Token = new Token()
let $loader: any
let $i18n: any
let $notify: any
let $log: any

export function initializeLog(log: any) {
  $log = log
}

export function initializeAxios(axiosInstance: NuxtAxiosInstance) {
  $axios = axiosInstance
  $token = new Token()
}

export function initializeLoader(loader: any) {
  $loader = loader
}

export function initializeI18n(i18n: any) {
  $i18n = i18n
}

export function initializeNotify(notify: any) {
  $notify = notify
}

export { $axios, $loader, $i18n, $token, $notify, $log }
