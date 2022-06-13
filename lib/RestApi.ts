import * as sst from '@serverless-stack/resources'
import {
  Authorizer,
  Cors,
  MethodLoggingLevel,
} from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import { SubnetType } from 'aws-cdk-lib/aws-ec2'
import { ROUTES } from 'shared/routes'
import { APP_BUCKET_NAMES } from './BucketConfig'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'
import { ApiGatewayV1ApiAuthorizer } from '@serverless-stack/resources'

export default class RestApi extends sst.Stack {
  constructor(scope: sst.App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const inVpc = {
      vpc: scope.local ? undefined : props.vpc,
      vpcSubnets: scope.local
        ? undefined
        : {
            subnetType: SubnetType.PRIVATE_ISOLATED,
          },
      securityGroups: scope.local
        ? undefined
        : props.sgForIsolatedSubnet
        ? [props.sgForIsolatedSubnet]
        : [],
    }

    const proxy128 = {
      function: 'src/rest/proxy128.handler',
      memorySize: 128,
    }

    const proxy128InVpc = {
      memorySize: 128,
      function: {
        handler: 'src/rest/proxy128.handler',
        ...inVpc,
      },
    }

    props.restApi = new sst.ApiGatewayV1Api<
      Record<string, ApiGatewayV1ApiAuthorizer>
    >(this, constructId('rest-api', props), {
      authorizers: {
        Authorizer: {
          type: 'user_pools',
          userPoolIds: props.cognitoUserPool
            ? [props.cognitoUserPool.userPoolId]
            : [],
        },
      },
      defaults: {
        // @ts-ignore
        authorizer: 'Authorizer',
      },
      restApi: {
        defaultCorsPreflightOptions: {
          allowMethods: Cors.ALL_METHODS,
          allowOrigins: [
            'http://localhost:3000',
            'https://dev.pelefele.com',
            'https://pelefele.com',
          ],
          allowHeaders: [...Cors.DEFAULT_HEADERS, 'x-language'],
        },
        deployOptions: {
          methodOptions: {
            '/*/*': {
              throttlingRateLimit: props.isProd ? 100 : 5,
              throttlingBurstLimit: props.isProd ? 20 : 4,
            },
          },
          tracingEnabled: false,
          loggingLevel: MethodLoggingLevel.OFF,
        },
      },
      routes: {
        // route for associations only like VPC, it makes sure that CDK won't drop exports and recreate stacks
        [ROUTES.GET_ADMIN_DUMMY]: {
          // methodOptions: {
          //   authorizationType: AuthorizationType.IAM,
          // },
          authorizer: 'iam',
          function: {
            handler: 'src/rest/admin/dummy.handler',
            vpc: props.vpc,
            vpcSubnets: {
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
            securityGroups: props.sgForIsolatedSubnet
              ? [props.sgForIsolatedSubnet]
              : [],
          },
        },
        [ROUTES.GET_ADMIN_PANEL]: {
          // methodOptions: {
          //   authorizationType: AuthorizationType.IAM,
          // },
          authorizer: 'iam',
          function: {
            handler: 'src/rest/admin/admin-panel.handler',
            ...inVpc,
            timeout: '15 minutes',
            memorySize: 10240,
          },
        },
        [ROUTES.GET_S3_SIGNED_URL]: proxy128,
        [ROUTES.POST_LISTING]: proxy128InVpc,
        [ROUTES.GET_LISTING]: proxy128,
        [ROUTES.GET_LISTINGS]: proxy128,
        [ROUTES.GET_SEARCH]: {
          function: {
            handler: 'src/rest/es-search.handler',
            ...inVpc,
          },
        },
      },
      defaultFunctionProps: {
        environment: {
          DYNAMODB_TABLE_NAME: props.dynamoDbTable?.cdk.table.tableName,
          LISTING_SQS_DLQ_URL: props.listingStreamDQL?.cdk.queue.queueUrl,
          APP_OUTPUT_PARAMETER_NAME: props.appOutputParameterName,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
          REGION: props.region,
          STAGE: props.stage,
          APP_BUCKET_NAME: props.isDev
            ? APP_BUCKET_NAMES.DEV_APP_CONFIG
            : props.isLocal
            ? APP_BUCKET_NAMES.LOCAL_APP_CONFIG
            : APP_BUCKET_NAMES.PROD_APP_CONFIG,
          IMG_UPLOAD_BUCKET_NAME: props.isDev
            ? APP_BUCKET_NAMES.DEV_UPLOAD_BUCKET
            : props.isLocal
            ? APP_BUCKET_NAMES.LOCAL_UPLOAD_BUCKET
            : APP_BUCKET_NAMES.PROD_UPLOAD_BUCKET,
          IMG_BUCKET_NAME: props.isDev
            ? APP_BUCKET_NAMES.DEV_ASSETS_BUCKET
            : props.isLocal
            ? APP_BUCKET_NAMES.LOCAL_ASSETS_BUCKET
            : APP_BUCKET_NAMES.PROD_ASSETS_BUCKET,
        },
      },
      customDomain: {
        domainName: props.restApiEndpointCname,
        hostedZone: props.hostedZoneName,
        path: props.restApiPath,
      },
      accessLog: false,
    })

    props.restApi?.cdk.restApi.addUsagePlan(
      constructId('rest-api-usage-plan', props),
      {
        apiStages: [
          {
            api: props.restApi.cdk.restApi,
            stage: props.restApi.cdk.restApi.deploymentStage,
          },
        ],
        throttle: {
          rateLimit: props.isProd ? 100 : 5,
          burstLimit: props.isProd ? 20 : 4,
        },
      }
    )

    if (props.dynamoDbTable) {
      props.restApi?.attachPermissions([props.dynamoDbTable])
    }
    props.restApi?.attachPermissions([
      props.bucketConfig.applicationConfigBucket,
      props.bucketConfig.imgUploadBucket,
    ])

    props.restApi?.attachPermissions([
      new iam.PolicyStatement({
        actions: [
          'ec2:CreateNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'ec2:DeleteNetworkInterface',
          'ec2:DescribeSecurityGroups',
          'ec2:DescribeSubnets',
          'ec2:DescribeVpcs',
        ],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      }),
    ])
    props.restApi?.attachPermissions([
      new iam.PolicyStatement({
        actions: [
          'es:ESHttp*',
          'sqs:ReceiveMessage',
          'ssm:GetParameter',
          'sqs:DeleteMessage',
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          `${props.esDomain?.domainArn}/*`,
          props.listingStreamDQL?.cdk.queue.queueArn as string,
          `arn:aws:ssm:${props.region}:${props.account}:parameter/app-output/*`,
        ],
      }),
    ])
  }
}
