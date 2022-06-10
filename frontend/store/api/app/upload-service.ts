import { ROUTE_NAMES } from '@backend/routes'
import { S3SignedUrls, S3SignedUrlsSchema, S3SignUrl } from '@backend/s3'
import ApiCall from '~/store/api/api-call'

export default class UploadService {
  apiCall: ApiCall = new ApiCall()

  async getSignedUploadUrls(count: number): Promise<Array<S3SignUrl>> {
    const response = await this.apiCall.$get<
      S3SignedUrls,
      typeof S3SignedUrlsSchema
    >(ROUTE_NAMES.S3_SIGNED_URLS, S3SignedUrlsSchema, { count })

    if (response?.status.success) {
      return response.s3SignUrls
    }
    return []
  }

  /**
   * Upload form data directly to S3 object, upload data is POST-ed to pre-signed S3 URL
   */
  async uploadS3Post(signedUrl: string, file: File) {
    return await this.apiCall
      .dereference()
      .put(signedUrl, file, {
        headers: { 'Content-Type': 'application/octet-stream' },
      })
  }
}
