import { Bucket } from '@serverless-stack/resources'
import { S3Client } from '@aws-sdk/client-s3'
import { AppStackProps } from './AppStackProps'

export enum APP_BUCKET_NAMES {
  PROD_APP_CONFIG = 'prod-app-config.pelefele.com',
  PROD_ASSETS_BUCKET = 'prod-assets.pelefele.com',
  PROD_UPLOAD_BUCKET = 'prod-upload.pelefele.com',

  DEV_APP_CONFIG = 'dev-app-config.pelefele.com',
  DEV_ASSETS_BUCKET = 'dev-assets.pelefele.com',
  DEV_UPLOAD_BUCKET = 'dev-upload.pelefele.com',

  LOCAL_APP_CONFIG = 'local-app-config.pelefele.com',
  LOCAL_ASSETS_BUCKET = 'local-assets.pelefele.com',
  LOCAL_UPLOAD_BUCKET = 'local-upload.pelefele.com'
}


export default class BucketConfig {
    public applicationConfigBucketName: string
    public applicationConfigBucket: Bucket
    public imgUploadBucket: Bucket
    private s3Client: S3Client

    public async init (props: AppStackProps) {
      this.s3Client = await new S3Client({ region: props.region })
    }

    getS3UploadBucketName (stage: string) {
      if (stage === 'dev') { return APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET }
      if (stage === 'prod') { return APP_BUCKET_NAMES.PROD_UPLOAD_BUCKET }
      if (stage === 'local') { return APP_BUCKET_NAMES.LOCAL_UPLOAD_BUCKET }

      return ''
    }

    getS3ImgBucketName (stage: string) {
      if (stage === 'dev') { return APP_BUCKET_NAMES.DEV_ASSETS_BUCKET }
      if (stage === 'prod') { return APP_BUCKET_NAMES.PROD_ASSETS_BUCKET }
      if (stage === 'local') { return APP_BUCKET_NAMES.LOCAL_ASSETS_BUCKET }

      return ''
    }
}
