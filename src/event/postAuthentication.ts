import {
  PostAuthenticationTriggerEvent,
  PostAuthenticationTriggerHandler
} from 'aws-lambda/trigger/cognito-user-pool-trigger/post-authentication'
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient({ region: process.env.region })

export const handler: PostAuthenticationTriggerHandler = async (
  event: PostAuthenticationTriggerEvent
) => {
  await client.send(new AdminUpdateUserAttributesCommand({
    UserPoolId: event.userPoolId,
    Username: event.userName,
    UserAttributes: [
      { Name: 'email_verified', Value: 'true' }
    ]
  }))

  return event
}
