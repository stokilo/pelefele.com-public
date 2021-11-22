import { S3Event, S3Handler } from 'aws-lambda/trigger/s3'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { readBinaryBucket } from 's3/s3-reader'
import { logger } from 'common/logger'

const s3ImgBucketName = process.env.S3_IMG_BUCKET!

export const handler: S3Handler = async (event: S3Event) => {
  try {
    const srcBucketName = event.Records[0].s3.bucket.name
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
    const dstKey = `${srcKey}-10x10`
    logger.info(`S3 image job started for: ${srcKey}`)

    const s3Client = new S3Client({ region: process.env.REGION })
    const srcImage = await readBinaryBucket(srcBucketName, srcKey)
    const resizedImage = await sharp(srcImage, {}).resize(10, 10).toBuffer()

    const putUploaded = await s3Client.send(new PutObjectCommand({
      Bucket: s3ImgBucketName,
      Key: srcKey,
      Body: srcImage,
      ContentType: 'image'
    }))

    const putResized = await s3Client.send(new PutObjectCommand({
      Bucket: s3ImgBucketName,
      Key: dstKey,
      Body: resizedImage,
      ContentType: 'image'
    }))

    if (putResized.$metadata.httpStatusCode !== 200 ||
       putUploaded.$metadata.httpStatusCode !== 200) {
      logger.info('S3 resize image job failed')
      logger.info(putResized)
      logger.info(putUploaded)
    } else {
      logger.info('S3 resize image success ' + srcBucketName + '/' + srcKey +
        ' upload destination ' + s3ImgBucketName + '/' + dstKey)
    }
  } catch (error) {
    logger.error(error)
  }
}
