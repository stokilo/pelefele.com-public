import { App, Function, Stack } from '@serverless-stack/resources'
import * as cdk from 'aws-cdk-lib'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { SubnetType } from 'aws-cdk-lib/aws-ec2'
import iam, { Effect } from 'aws-cdk-lib/aws-iam'
import {
  StepFunctionMigrationError,
  StepFunctionMigrationOkAllDone,
  StepFunctionMigrationOkContinue
} from '../src/step'
import { APP_BUCKET_NAMES } from './BucketConfig'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

/**
 * Stack to execute state machine responsible for post deployment migrations.
 * Migrations includes: schema changes, data imports, data processing.
 * This should not include stack updates, for that use @PostDeploymentUpdateStack step functions.
 */
export class PostDeploymentMigrationStack extends Stack {
  constructor (scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const sWait = new sfn.Wait(this, constructId('post-deployment-migration-sfn-wait', props), {
      time: sfn.WaitTime.duration(cdk.Duration.seconds(10))
    })

    const inVpc = {
      vpc: props.vpc!,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      securityGroups: [props.sgForIsolatedSubnet!]
    }

    const handlerFunction = new Function(this, constructId('post-deployment-migration-lambda', props), {
      enableLiveDev: false,
      handler: 'src/step/post-deployment-migration.handler',
      ...inVpc,
      timeout: Duration.minutes(15),
      memorySize: 10240,
      environment: {
        REGION: props.region,
        APP_OUTPUT_PARAMETER_NAME: props.appOutputParameterName,
        DYNAMODB_TABLE_NAME: props.dynamoDbTable!.dynamodbTable.tableName,
        APP_BUCKET_NAME: props.isDev ? APP_BUCKET_NAMES.DEV_APP_CONFIG : props.isLocal ? APP_BUCKET_NAMES.LOCAL_APP_CONFIG : APP_BUCKET_NAMES.PROD_APP_CONFIG,
        STAGE: props.stage
      }
    })
    handlerFunction.attachPermissions([props.dynamoDbTable!, props.bucketConfig.applicationConfigBucket])
    handlerFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['es:ESHttp*', 'ssm:GetParameter'],
      resources: [
        `${props.esDomain?.domainArn!}/*`,
        props.appOutputParameter?.parameterArn!
      ]
    }))

    const postDeploymentMigrationLambda = new tasks.LambdaInvoke(this, constructId('post-deployment-migration-lambda-invoke', props), {
      lambdaFunction: handlerFunction,
      outputPath: '$.Payload'
    })

    const sFailed = new sfn.Fail(this, constructId('post-deployment-migration-sfn-fail', props))
    const sSuccess = new sfn.Succeed(this, constructId('post-deployment-migration-sfn-succeed', props))

    props.postDeploymentMigrationStateMachine = new sfn.StateMachine(this, constructId('post-deployment-migration-state-machine', props), {
      timeout: Duration.hours(1),
      definition: sWait
        .next(postDeploymentMigrationLambda)
        .next(
          new sfn.Choice(this, 'Migration finished successfully?')
            .when(sfn.Condition.stringEquals('$.status', StepFunctionMigrationOkAllDone), sSuccess)
            .when(sfn.Condition.stringEquals('$.status', StepFunctionMigrationOkContinue), sWait)
            .when(sfn.Condition.stringEquals('$.status', StepFunctionMigrationError), sFailed)
            .otherwise(sWait)
        )
    })

    props.postDeploymentMigrationStateMachine.applyRemovalPolicy(RemovalPolicy.DESTROY)
  }
}
