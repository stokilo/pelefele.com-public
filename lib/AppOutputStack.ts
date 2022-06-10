/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'
import * as SSM from 'aws-cdk-lib/aws-ssm'
import * as iam from 'aws-cdk-lib/aws-iam'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export default class AppOutputStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const ssmValue = {
      appName: props.appName,
      region: props.region,
      restApiEndpointCname: props.restApiEndpointCname,
      restApiPath: props.restApiPath,
      restApiName: props.restApiName,
      cognitoUserPoolId: props.cognitoUserPool!.userPoolId,
      cognitoUserPoolClientId: props.cognitoUserPoolClient!.userPoolClientId,
      cognitoDomainPrefix: props.cognitoDomainPrefix,
      cognitoRedirectSignInUrl: props.cognitoRedirectSignInUrl,
      cognitoRedirectSignOutUrl: props.cognitoRedirectSignOutUrl,
      cognitoIdentityPoolId: props.cognitoCfnIdentityPool!.ref,
      esDomainEndpoint: props.esDomain!.domainEndpoint,
      esEndpointCname: props.esEndpointCname,
    }

    props.appOutputParameter = new SSM.StringParameter(
      this,
      constructId('app-output-parameter', props),
      {
        parameterName: props.appOutputParameterName,
        description: `Parameter store for application: ${props.appName} and stage: ${props.stage}`,
        stringValue: JSON.stringify(ssmValue),
      }
    )

    const arr = [props.dynamoDbListingStreamLambda!, props.restApi!]
    arr.forEach((construct) => {
      construct.attachPermissions([
        new iam.PolicyStatement({
          actions: ['ssm:GetParameter'],
          effect: iam.Effect.ALLOW,
          resources: [props.appOutputParameter?.parameterArn!],
        }),
      ])
    })
    this.addOutputs(ssmValue)
  }
}
