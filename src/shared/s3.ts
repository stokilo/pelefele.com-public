import * as zod from 'zod'
import { StatusSchema } from './form'

export const S3SignUrlSchema = zod.object({
  url: zod.string(),
  fileName: zod.string()
})

export const S3SignedUrlsSchema = zod.object({
  status: StatusSchema,
  s3SignUrls: zod.array(S3SignUrlSchema)
})

export type S3SignUrl = zod.TypeOf<typeof S3SignUrlSchema>
export type S3SignedUrls= zod.TypeOf<typeof S3SignedUrlsSchema>
