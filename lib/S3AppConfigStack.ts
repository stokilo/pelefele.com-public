/* eslint-disable no-new */
import { App, Bucket, Stack } from '@serverless-stack/resources'
import { BucketDeployment, Source, StorageClass } from '@aws-cdk/aws-s3-deployment'
import { BlockPublicAccess } from '@aws-cdk/aws-s3'
import { RemovalPolicy } from '@aws-cdk/core'
import { APP_BUCKET_NAMES } from './BucketConfig'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export default class S3AppConfigStack extends Stack {
  constructor (scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const bucketName = props.isDev
      ? APP_BUCKET_NAMES.DEV_APP_CONFIG
      : props.isLocal
        ? APP_BUCKET_NAMES.LOCAL_APP_CONFIG
        : APP_BUCKET_NAMES.PROD_APP_CONFIG

    const sstConfigBucket = new Bucket(this, constructId('app-config-bucket', props), {
      s3Bucket: {
        bucketName,
        publicReadAccess: false,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true
      }
    })

    new BucketDeployment(this, constructId('app-config-bucket-deployment', props), {
      sources: [Source.asset('./lib/data/')],
      destinationBucket: sstConfigBucket.s3Bucket,
      retainOnDelete: false,
      prune: true,
      storageClass: StorageClass.STANDARD,
      memoryLimit: 3008
    })

    props.bucketConfig.applicationConfigBucketName = bucketName
    props.bucketConfig.applicationConfigBucket = sstConfigBucket
  }
}
