import * as sst from '@serverless-stack/resources'
import { Function, Queue, Table, TableFieldType } from '@serverless-stack/resources'
import { Duration, RemovalPolicy } from '@aws-cdk/core'
import { SubnetType } from '@aws-cdk/aws-ec2'
import iam, { Effect } from '@aws-cdk/aws-iam'
import { SqsDlq } from '@aws-cdk/aws-lambda-event-sources'
import { StartingPosition } from '@aws-cdk/aws-lambda'
import { ProjectionType } from '@aws-cdk/aws-dynamodb'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export default class DynamoDbStack extends sst.Stack {
  constructor (scope: sst.App, id: string, props: AppStackProps) {
    super(scope, id, props)

    props.listingStreamDQL = new Queue(this, constructId('listing-stream-sqs-dlq', props))
    props.listingStreamDQL.sqsQueue.metricApproximateNumberOfMessagesVisible({
      period: Duration.minutes(5)
    }).createAlarm(this, 'SqsDlqAlarm', {
      alarmName: 'SqsDlqAlarm',
      alarmDescription: 'There is a message to process in SQS DLQ',
      threshold: 1,
      evaluationPeriods: 2
    })

    const inVpc = {
      vpc: scope.local ? undefined : props.vpc!,
      vpcSubnets: scope.local
        ? undefined
        : {
            subnetType: SubnetType.PRIVATE_ISOLATED
          },
      securityGroups: scope.local ? undefined : [props.sgForIsolatedSubnet!]
    }

    props.dynamoDbTable = new Table(this, 'main-table', {
      fields: {
        pk: TableFieldType.STRING,
        sk: TableFieldType.STRING
      },
      primaryIndex: {
        partitionKey: 'pk',
        sortKey: 'sk'
      },
      globalIndexes: {
        gsi1: {
          partitionKey: 'gsi1pk',
          sortKey: 'gsi1sk',
          indexProps: {
            nonKeyAttributes: ['data'],
            projectionType: ProjectionType.INCLUDE
          }
        }
      },
      dynamodbTable: {
        removalPolicy: RemovalPolicy.DESTROY
      },
      stream: true
    })

    props.dynamoDbListingStreamLambda = new Function(this, constructId('listing-stream-lambda', props), {
      enableLiveDev: scope.local,
      handler: 'src/streams/listing-consumer.handler',
      ...inVpc,
      timeout: 5,
      environment: {
        DYNAMODB_TABLE_NAME: props.dynamoDbTable!.dynamodbTable.tableName,
        APP_OUTPUT_PARAMETER_NAME: props.appOutputParameterName,
        REGION: props.region,
        STAGE: props.stage
      }
    })
    props.dynamoDbListingStreamLambda.attachPermissions([props.listingStreamDQL])
    props.dynamoDbListingStreamLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'es:ESHttp*',
        'sqs:SendMessage'],
      resources: [
        `${props.esDomain?.domainArn!}/*`,
        props.listingStreamDQL.sqsQueue.queueArn
      ]
    }))
    props.dynamoDbListingStreamLambda.attachPermissions([props.dynamoDbTable])

    props.dynamoDbTable.addConsumers(this, {
      esConsumer: {
        consumerProps: {
          startingPosition: StartingPosition.TRIM_HORIZON,
          onFailure: new SqsDlq(props.listingStreamDQL.sqsQueue),
          retryAttempts: 2,
          bisectBatchOnError: true
        },
        function: props.dynamoDbListingStreamLambda
      }
    })
  }
}
