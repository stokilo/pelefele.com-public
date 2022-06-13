/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import BucketConfig from '../lib/BucketConfig'
import CognitoStack from '../lib/CognitoStack'
import { PostDeploymentUpdateStack } from './PostDeploymentUpdateStack'
import VpcStack from './VpcStack'
import VpnStack from './VpnStack'
import ElasticStack from './ElasticStack'
import S3AppConfigStack from './S3AppConfigStack'
import DynamoDbStack from './DynamoDbStack'
import S3WebsiteStack from './S3WebsiteStack'
import { PostDeploymentTrigger } from './PostDeploymentTrigger'
import { PostDeploymentMigrationStack } from './PostDeploymentMigrationStack'
import { AppStackProps } from './AppStackProps'
import RestApi from './RestApi'
import AllStagesSecretStack from './AllStagesSecretStack'
import AppOutputStack from './AppOutputStack'

export function constructName(
  constructNamePrefix: string,
  stackProps: AppStackProps
) {
  const formatted = constructNamePrefix
    .split('-')
    .map(
      (elem) => elem.charAt(0).toUpperCase() + elem.slice(1).toLocaleLowerCase()
    )
    .join('')
  const appName =
    stackProps.appName.charAt(0).toUpperCase() +
    stackProps.appName.slice(1).toLocaleLowerCase()
  const stage =
    stackProps.stage.charAt(0).toUpperCase() +
    stackProps.stage.slice(1).toLocaleLowerCase()
  return `${formatted}-${appName}-${stage}`
}

export function constructId(
  constructIdPrefix: string,
  stackProps: AppStackProps
) {
  const formatted = constructIdPrefix
    .split('-')
    .map(
      (elem) => elem.charAt(0).toUpperCase() + elem.slice(1).toLocaleLowerCase()
    )
    .join('')
  return constructName(constructIdPrefix, stackProps)
}

export default async function main(app: sst.App): Promise<void> {
  const appName = 'pelefele'
  const domainStagePrefix = `${app.stage}.`
  const hostedZoneName = 'aws-rest-api.com'
  const allStagesSecretName = `all-stages/${appName}`
  const restApiEndpointCname = `${domainStagePrefix}api.aws-rest-api.com`
  const restApiPath = 'v1'
  const restApiName = 'api.pelefele.com'

  const cognitoDomainPrefix = process.env.COGNITO_DOMAIN_PREFIX as string
  const cognitoCallbackUrlLocalMode = process.env
    .COGNITO_CALLBACK_URL_LOCAL_MODE as string
  const cognitoCallbackUrl = process.env.COGNITO_CALLBACK_URL as string
  const cognitoLogoutUrl = process.env.COGNITO_LOGOUT_URL as string
  const cognitoRedirectSignInUrl = process.env.IS_LOCAL
    ? cognitoCallbackUrlLocalMode
    : cognitoCallbackUrl
  const cognitoRedirectSignOutUrl = process.env.IS_LOCAL
    ? cognitoCallbackUrlLocalMode
    : cognitoLogoutUrl

  const esEndpointCname = `${domainStagePrefix}es.aws-rest-api.com`
  const appOutputParameterName = `/app-output/${appName}/${app.stage}`

  const props: AppStackProps = {
    appName,
    allStagesSecretName,
    restApiEndpointCname,
    restApiPath,
    restApiName,

    hostedZoneName,

    esEndpointCname,

    appOutputParameterName,

    cognitoDomainPrefix,
    cognitoRedirectSignInUrl,
    cognitoRedirectSignOutUrl,

    account: app.account,
    region: app.region,
    stage: app.stage,
    stageUpperCase: app.stage.toUpperCase(),

    isDev: app.stage === 'dev',
    isProd: app.stage === 'prod',
    isLocal: app.stage === 'local',
    domainStagePrefix: `${app.stage}.`,

    bucketConfig: new BucketConfig(),
  }
  await props.bucketConfig.init(props)

  app.setDefaultFunctionProps({
    runtime: 'nodejs14.x',
    logRetention: RetentionDays.ONE_DAY,
  })

  app.setDefaultFunctionProps({
    memorySize: 128,
    environment: {
      APP_NAME: props.appName,
      REGION: props.region,
      ES_DOMAIN_HTTP: `http://${props.domainStagePrefix}es.aws-rest-api.com`,
      VPN_DOMAIN: `*.${props.domainStagePrefix}vpn.aws-rest-api.com`,
      S3_UPLOAD_BUCKET: props.bucketConfig.getS3UploadBucketName(app.stage),
      S3_IMG_BUCKET: props.bucketConfig.getS3ImgBucketName(app.stage),
    },
  })

  const allStagesSecretStack = new AllStagesSecretStack(
    app,
    'all-stages-secret',
    props
  )
  const vpcStack = new VpcStack(app, 'vpc', props)
  const s3AppConfigStack = new S3AppConfigStack(app, 's3-app-config', props)
  const elasticStack = new ElasticStack(app, 'es', props)
  const dynamoDbStack = new DynamoDbStack(app, 'dynamodb', props)
  const cognitoStack = new CognitoStack(app, 'cognito', props)
  const s3WebsiteStack = new S3WebsiteStack(app, 's3-website', props)
  const restApi = new RestApi(app, 'rest-api', props)
  const vpnStack = new VpnStack(app, 'vpn', props)
  const appOutputStack = new AppOutputStack(app, 'app-output-stack', props)
  const postDeploymentUpdateStack = new PostDeploymentUpdateStack(
    app,
    'post-deploy-update',
    props
  )
  const postDeploymentMigrationStack = new PostDeploymentMigrationStack(
    app,
    'post-deploy-migrate',
    props
  )
  const postDeploymentTrigger = new PostDeploymentTrigger(
    app,
    'post-deploy-trigger',
    props
  )

  restApi.addDependency(allStagesSecretStack)
  elasticStack.addDependency(allStagesSecretStack)
  cognitoStack.addDependency(allStagesSecretStack)
  postDeploymentUpdateStack.addDependency(allStagesSecretStack)

  postDeploymentTrigger.addDependency(allStagesSecretStack)
  postDeploymentTrigger.addDependency(vpcStack)
  postDeploymentTrigger.addDependency(elasticStack)
  postDeploymentTrigger.addDependency(vpnStack)
  postDeploymentTrigger.addDependency(appOutputStack)
  postDeploymentTrigger.addDependency(restApi)
  postDeploymentTrigger.addDependency(cognitoStack)
  postDeploymentTrigger.addDependency(dynamoDbStack)
  postDeploymentTrigger.addDependency(s3AppConfigStack)
  postDeploymentTrigger.addDependency(s3WebsiteStack)
  postDeploymentTrigger.addDependency(postDeploymentUpdateStack)
  postDeploymentTrigger.addDependency(postDeploymentMigrationStack)
}
