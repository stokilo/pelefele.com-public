import { logger } from 'common/logger'
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'

const sfnClient = new SFNClient({ region: process.env.REGION })

/**
 * This is a trigger lambda to migrations.
 */
export const handler: () => Promise<boolean> = async () => {
  await logger.info('Step function migration started')

  const startCommandPostDeployment = new StartExecutionCommand({
    stateMachineArn: process.env.POST_DEPLOYMENT_STATE_MACHINE_ARN!,
    input: '{}'
  })
  const responseStartPostDeployment = await sfnClient.send(startCommandPostDeployment)
  logger.info(responseStartPostDeployment)

  const startCommand = new StartExecutionCommand({
    stateMachineArn: process.env.MIGRATION_STATE_MACHINE_ARN!,
    input: '{}'
  })
  const responseStart = await sfnClient.send(startCommand)
  logger.info(responseStart)

  return true
}
