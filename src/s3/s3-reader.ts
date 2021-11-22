import { Readable } from 'stream'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

async function streamToString (stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}

async function streamToUint8Array (stream: Readable): Promise<Uint8Array> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export async function readTextBucket (bucketName: string, bucketKey: string) {
  const s3Client = new S3Client({ region: process.env.REGION })

  const configTest = await s3Client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: bucketKey
  }))

  return await streamToString(configTest.Body as Readable)
}

export async function readBinaryBucket (bucketName: string, bucketKey: string) {
  const s3Client = new S3Client({ region: process.env.REGION })

  const configTest = await s3Client.send(new GetObjectCommand({
    Bucket: bucketName,
    Key: bucketKey
  }))

  return await streamToUint8Array(configTest.Body as Readable)
}
