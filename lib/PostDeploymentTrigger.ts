import { App, Stack, Script } from '@serverless-stack/resources'
import iam from 'aws-cdk-lib/aws-iam'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export class PostDeploymentTrigger extends Stack {
  constructor (scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const migrationScript = new Script(this, constructId('migration-script', props), {
      defaultFunctionProps: {
        timeout: 20,
        environment: {
          MIGRATION_STATE_MACHINE_ARN: props.postDeploymentMigrationStateMachine?.stateMachineArn!,
          POST_DEPLOYMENT_STATE_MACHINE_ARN: props.postDeploymentUpdateStackStateMachine?.stateMachineArn!
        }
      },
      onCreate: 'src/step/post-deployment-trigger.handler',
      onUpdate: 'src/step/post-deployment-trigger.handler'
    })

    migrationScript.attachPermissions([
      new iam.PolicyStatement({
        actions: ['states:StartExecution'],
        effect: iam.Effect.ALLOW,
        resources: [props.postDeploymentMigrationStateMachine!.stateMachineArn,
        props.postDeploymentUpdateStackStateMachine!.stateMachineArn]
      })
    ])
  }
}
