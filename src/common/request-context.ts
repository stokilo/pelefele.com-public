import { APIGatewayProxyEvent } from 'aws-lambda'

export interface RequestContext {
  userId: string
}

export const toRequestContext = (e: APIGatewayProxyEvent) => {

  const authorizer = e.requestContext.authorizer
  const claims = authorizer!.claims ? authorizer!.claims : {}

  if (claims['cognito:username']) {
    return {
      userId: claims['cognito:username']
    }
  } else {
    throw new Error('Unable to construct request context, user id is not defined')
  }
}
