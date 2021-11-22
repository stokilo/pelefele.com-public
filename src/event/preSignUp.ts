import {
  PreSignUpTriggerEvent,
  PreSignUpTriggerHandler
} from 'aws-lambda/trigger/cognito-user-pool-trigger/pre-signup'

export const handler: PreSignUpTriggerHandler = async (
  event: PreSignUpTriggerEvent
) => {
  event.response.autoVerifyEmail = true
  event.response.autoVerifyPhone = true
  event.response.autoConfirmUser = true

  return await event
}
