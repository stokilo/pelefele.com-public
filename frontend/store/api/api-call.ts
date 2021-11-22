import { ZodType } from 'zod/lib/types'
import { API } from '@aws-amplify/api'
import awsConfig from './../../aws-config.json'
import { $axios, $i18n, $log } from '~/utils/api'

interface ApiCallConfig {
  headers: Record<string, string>
  timeout: number
}

/**
 * Generic base service to make API calls. It provides high level function to invoke WS and process result.
 */
export default class ApiCall {
  POST_CONFIG: ApiCallConfig = {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000
  }

  getRequestConfig (): Object {
    const config = { ...this.POST_CONFIG }
    config.headers['X-Language'] = $i18n.locale
    return config
  }

  async $get<T, E extends ZodType<T>> (routePath: string, schema: E, params: object = {}): Promise<T | undefined> {
    try {
      const result = await API.get(awsConfig.restApiName, routePath,
        { ...this.getRequestConfig(), queryStringParameters: params })
      console.info({ result })
      return schema.parse(result)
    } catch (err) {
      $log.error(err)
    }
    return undefined
  }

  async $post<T1, T2, E extends ZodType<T2>> (routePath: string, model: T1, responseSchema: E): Promise<T2 | undefined> {
    try {
      const result = await API.post(awsConfig.restApiName, routePath,
        {
          ...this.getRequestConfig(),
          body: model
        })

      return responseSchema.parse(result)
    } catch (err) {
      $log.error(err)
    }
    return undefined
  }

  dereference () {
    return $axios
  }
}
