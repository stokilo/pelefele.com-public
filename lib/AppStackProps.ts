import { UserPool, UserPoolClient } from '@aws-cdk/aws-cognito'
import { Function, ApiGatewayV1Api, Queue, StackProps, Table } from '@serverless-stack/resources'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as es from '@aws-cdk/aws-elasticsearch'
import * as sfn from '@aws-cdk/aws-stepfunctions'
import * as SSM from '@aws-cdk/aws-ssm'
import * as cognito from '@aws-cdk/aws-cognito'
import * as SM from '@aws-cdk/aws-secretsmanager'
import BucketConfig from '../lib/BucketConfig'

export declare type AppStackProps = StackProps & {

  appName: string

  allStagesSecretName: string
  allStagesSecrets?: SM.ISecret

  restApi?: ApiGatewayV1Api
  restApiEndpointCname: string
  restApiPath: string
  restApiName: string

  account: string
  region: string
  stage: string
  stageUpperCase: string

  isDev: boolean
  isProd: boolean
  isLocal: boolean
  domainStagePrefix: string

  hostedZoneName: string

  appOutputParameter?: SSM.StringParameter
  appOutputParameterName: string

  bucketConfig: BucketConfig

  vpc?: ec2.Vpc
  sgForIsolatedSubnet?: ec2.SecurityGroup
  vpnEndpoint?: ec2.ClientVpnEndpoint

  dynamoDbTable?: Table
  listingStreamDQL?: Queue

  esDomain?: es.Domain
  esEndpointCname: string

  cognitoDomainPrefix: string
  cognitoRedirectSignInUrl: string
  cognitoRedirectSignOutUrl: string
  cognitoUserPool?: UserPool
  cognitoUserPoolClient?: UserPoolClient
  cognitoCfnIdentityPool?: cognito.CfnIdentityPool;

  postDeploymentMigrationStateMachine?: sfn.StateMachine
  postDeploymentUpdateStackStateMachine?: sfn.StateMachine

  dynamoDbListingStreamLambda?: Function
}
