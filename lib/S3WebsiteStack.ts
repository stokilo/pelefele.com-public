/* eslint-disable no-new */
import { App, Bucket as SBucket, Stack } from '@serverless-stack/resources'
import { HttpMethods } from 'aws-cdk-lib/aws-s3'
import { RemovalPolicy } from 'aws-cdk-lib'
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { AnyPrincipal } from 'aws-cdk-lib/aws-iam/lib/principals'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { APP_BUCKET_NAMES } from './BucketConfig'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'
import {
  BucketDeployment,
  Source,
  StorageClass,
} from 'aws-cdk-lib/aws-s3-deployment'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'

export default class S3WebsiteStack extends Stack {
  constructor(scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    if (props.isDev) {
      const assetsBucket = this.staticAssetBucket(
        APP_BUCKET_NAMES.DEV_ASSETS_BUCKET,
        props
      )
      this.uploadBucket(APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET, props, assetsBucket)
    } else if (props.isProd) {
      const assetsBucket = this.staticAssetBucket(
        APP_BUCKET_NAMES.PROD_ASSETS_BUCKET,
        props
      )
      this.uploadBucket(
        APP_BUCKET_NAMES.PROD_UPLOAD_BUCKET,
        props,
        assetsBucket
      )
    } else if (props.isLocal) {
      const assetsBucket = this.staticAssetBucket(
        APP_BUCKET_NAMES.LOCAL_ASSETS_BUCKET,
        props
      )
      this.uploadBucket(
        APP_BUCKET_NAMES.LOCAL_UPLOAD_BUCKET,
        props,
        assetsBucket
      )
    }
  }

  /**
   * S3 bucket for storing images has DNS on Cloudflare like: prod-assets.pelefele.com or dev-assets.pelefele.com
   * Bucket created here is for storing app images and serve them via cloudflare proxy only.
   */
  private staticAssetBucket(
    bucketName: APP_BUCKET_NAMES,
    props: AppStackProps
  ) {
    const sBucket = new SBucket(this, constructId('s3-assets-bucket', props), {
      cdk: {
        bucket: {
          bucketName,
          publicReadAccess: true,
          websiteIndexDocument: 'index.html',
          websiteErrorDocument: 'index.html',
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        },
      },
    })
    sBucket.cdk.bucket.addToResourcePolicy(
      this.getCloudflareAccessOnlyPolicy(bucketName, props)
    )

    new BucketDeployment(
      this,
      constructId('s3-assets-bucket-deployment', props),
      {
        sources: [Source.asset('./lib/data/assets/')],
        destinationBucket: sBucket.cdk.bucket,
        retainOnDelete: false,
        prune: true,
        storageClass: StorageClass.STANDARD,
        memoryLimit: 3008,
      }
    )
    return sBucket
  }

  /**
   * S3 bucket for uploading images.
   */
  private uploadBucket(
    bucketName: APP_BUCKET_NAMES,
    props: AppStackProps,
    assetsBucket: SBucket
  ) {
    const sBucket = new SBucket(this, constructId('s3-upload-bucket', props), {
      cdk: {
        bucket: {
          bucketName,
          publicReadAccess: false,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
          cors: [
            {
              allowedMethods: [HttpMethods.POST, HttpMethods.PUT],
              allowedOrigins: ['*'],
              allowedHeaders: ['*'],
            },
          ],
        },
      },
    })

    props.bucketConfig.imgUploadBucket = sBucket

    sBucket.addNotifications(this, {
      'upload-notification': {
        function: {
          handler: 'src/event/s3upload.handler',
          bundle: {
            externalModules: ['sharp'],
          },
          layers: [
            new lambda.LayerVersion(
              this,
              constructId('node-module-sharp-lambda-layer', props),
              {
                code: lambda.Code.fromAsset('layers/sharp'),
              }
            ),
          ],
          permissions: [sBucket, assetsBucket],
          memorySize: 1024,
          logRetention: RetentionDays.ONE_DAY,
        },
      },
    })
  }

  /**
   * Policy allows only developer and cloudflare IP to access the website
   */
  getCloudflareAccessOnlyPolicy(
    bucketName: string,
    props: AppStackProps
  ): PolicyStatement {
    return new PolicyStatement({
      sid: constructId('cloudflare-access-bucket-policy', props),
      actions: ['s3:GetObject'],
      effect: Effect.ALLOW,
      resources: [`arn:aws:s3:::${bucketName}/*`],
      principals: [new AnyPrincipal()],
      conditions: {
        IpAddress: {
          'aws:SourceIp': [
            '87.201.160.186',

            '2400:cb00::/32',
            '2606:4700::/32',
            '2803:f800::/32',
            '2405:b500::/32',
            '2405:8100::/32',
            '2a06:98c0::/29',
            '2c0f:f248::/32',
            '173.245.48.0/20',
            '103.21.244.0/22',
            '103.22.200.0/22',
            '103.31.4.0/22',
            '141.101.64.0/18',
            '108.162.192.0/18',
            '190.93.240.0/20',
            '188.114.96.0/20',
            '197.234.240.0/22',
            '198.41.128.0/17',
            '162.158.0.0/15',
            '172.64.0.0/13',
            '131.0.72.0/22',
            '104.16.0.0/13',
            '104.24.0.0/14',
          ],
        },
      },
    })
  }
}
