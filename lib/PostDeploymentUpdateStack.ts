import { App, Function, Stack } from '@serverless-stack/resources'
import * as cdk from 'aws-cdk-lib'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'
import iam, { Effect } from 'aws-cdk-lib/aws-iam'
import { StepFunctionResultSuccess } from 'step'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

/**
 * Stack to execute state machine responsible for post deployment updates.
 * Not everything is possible with CDK. This state machine executes lambda that calls various API endpoints using SDK.
 */
export class PostDeploymentUpdateStack extends Stack {
  constructor(scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const sWait = new sfn.Wait(
      this,
      constructId('post-deployment-update-stack-sfn-wait', props),
      {
        time: sfn.WaitTime.duration(cdk.Duration.seconds(10)),
      }
    )

    const hostedZoneId = props
      .allStagesSecrets!.secretValueFromJson(
        `${props.stageUpperCase}_HOSTED_ZONE_ID`
      )
      .toString()
    const handlerFunction = new Function(
      this,
      constructId('post-deployment-update-lambda', props),
      {
        enableLiveDev: false,
        handler: 'src/step/post-deployment-update.handler',
        environment: {
          REGION: props.region,
          HOSTED_ZONE_ID: hostedZoneId,
        },
      }
    )

    handlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ec2:DescribeClientVpnEndpoints'],
        resources: ['*'],
      })
    )

    handlerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['route53:ChangeResourceRecordSets'],
        resources: [`arn:aws:route53:::hostedzone/${hostedZoneId}`],
      })
    )

    const postDeploymentUpdateLambda = new tasks.LambdaInvoke(
      this,
      constructId('post-deployment-update-lambda-invoke', props),
      {
        lambdaFunction: handlerFunction,
        outputPath: '$.Payload',
      }
    )
    const sFailed = new sfn.Fail(
      this,
      constructId('post-deployment-update-stack-sfn-fail', props)
    )
    const sSuccess = new sfn.Succeed(
      this,
      constructId('post-deployment-update-stack-sfn-succeed', props)
    )

    props.postDeploymentUpdateStackStateMachine = new sfn.StateMachine(
      this,
      constructId('post-deployment-update-state-machine', props),
      {
        timeout: Duration.minutes(10),
        definition: sWait
          .next(postDeploymentUpdateLambda)
          .next(
            new sfn.Choice(this, 'Is post deployment update finalized?')
              .when(
                sfn.Condition.stringEquals(
                  '$.status',
                  StepFunctionResultSuccess
                ),
                sSuccess
              )
              .otherwise(sFailed)
          ),
      }
    )

    props.postDeploymentUpdateStackStateMachine.applyRemovalPolicy(
      RemovalPolicy.DESTROY
    )
  }
}
