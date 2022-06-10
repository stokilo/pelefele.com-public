import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { RequestContext } from 'common/request-context'
import { v4 as uuidv4 } from 'uuid'
import { S3SignedUrls, S3SignUrl } from 'shared/s3'
import { StatusOK } from 'shared/form'

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

export class S3Service {
  s3Client = new S3Client({ region: process.env.REGION })
  readonly LIMIT_NUMBER_OF_SIGNED_URLS = 10

  async generatePreSignedUrl(
    event: APIGatewayProxyEvent,
    requestContext: RequestContext
  ): Promise<S3SignedUrls> {
    const currentDate = new Date()
    const objectKeyPrefix = `${currentDate.getFullYear()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${requestContext.userId}/${uuidv4()}`
    let count = 1
    if (
      event.queryStringParameters &&
      event.queryStringParameters.count &&
      !isNaN(+event.queryStringParameters.count)
    ) {
      count = +event.queryStringParameters.count
    }
    const s3SignUrls = await this.generatePreSignedUrls(
      objectKeyPrefix,
      count > this.LIMIT_NUMBER_OF_SIGNED_URLS
        ? this.LIMIT_NUMBER_OF_SIGNED_URLS
        : count
    )

    return {
      status: StatusOK(),
      s3SignUrls,
    }
  }

  async generatePreSignedUrls(
    objectKeyPrefix: string,
    count: number
  ): Promise<Array<S3SignUrl>> {
    const s3SignUrls: Array<S3SignUrl> = []
    for (let i = 0; i < count; i++) {
      const fileName = `${objectKeyPrefix}-${i}`
      const command = new PutObjectCommand({
        Bucket: process.env.IMG_UPLOAD_BUCKET_NAME,
        Key: fileName,
      })

      const url = await getSignedUrl(this.s3Client, command, {
        signingRegion: process.env.REGION,
        expiresIn: 600,
      })

      s3SignUrls.push({ url, fileName })
    }
    return s3SignUrls
  }
}
