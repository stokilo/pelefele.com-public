/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'
import { Auth, Function } from '@serverless-stack/resources'
import {
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderFacebook,
  UserPoolIdentityProviderGoogle,
  ClientAttributes,
} from 'aws-cdk-lib/aws-cognito'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { PolicyStatement, Policy } from 'aws-cdk-lib/aws-iam'
import { AppStackProps } from './AppStackProps'
import { constructId, constructName } from './index'

export default class CognitoStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const preSignupLambda = new Function(
      this,
      constructId('pre-signup-lambda', props),
      {
        handler: 'src/event/preSignUp.handler',
      }
    )

    const postAuthenticationLambda = new Function(
      this,
      constructId('post-authentication-lambda', props),
      {
        handler: 'src/event/postAuthentication.handler',
      }
    )

    props.cognitoUserPool = new UserPool(
      this,
      constructId('user-pool', props),
      {
        userPoolName: constructName('user-pool', props),
        signInAliases: {
          email: true,
          phone: false,
          username: true,
        },
        selfSignUpEnabled: true,
        removalPolicy: RemovalPolicy.DESTROY,
        lambdaTriggers: {
          postAuthentication: postAuthenticationLambda,
          preSignUp: preSignupLambda,
        },
        standardAttributes: {
          email: {
            required: true,
            mutable: true,
          },
        },
      }
    )

    postAuthenticationLambda.role?.attachInlinePolicy(
      new Policy(
        this,
        constructId('post-authentication-lambda-policy', props),
        {
          statements: [
            new PolicyStatement({
              actions: ['cognito-idp:AdminUpdateUserAttributes'],
              resources: [props.cognitoUserPool.userPoolArn],
            }),
          ],
        }
      )
    )

    props.cognitoUserPool.addDomain(constructId('cognito-domain', props), {
      cognitoDomain: {
        domainPrefix: props.cognitoDomainPrefix,
      },
    })

    const facebookProvider = new UserPoolIdentityProviderFacebook(
      this,
      constructId('user-pool-identity-provider-facebook', props),
      {
        userPool: props.cognitoUserPool,
        clientId: props
          .allStagesSecrets!.secretValueFromJson(
            `${props.stageUpperCase}_FACEBOOK_CLIENT_ID`
          )
          .toString(),
        clientSecret: props
          .allStagesSecrets!.secretValueFromJson(
            `${props.stageUpperCase}_FACEBOOK_CLIENT_SECRET`
          )
          .toString(),
        scopes: ['public_profile', 'email'],
        attributeMapping: {
          email: ProviderAttribute.FACEBOOK_EMAIL,
        },
      }
    )

    const googleProvider = new UserPoolIdentityProviderGoogle(
      this,
      constructId('user-pool-identify-provider-google', props),
      {
        userPool: props.cognitoUserPool,
        clientId: props
          .allStagesSecrets!.secretValueFromJson(
            `${props.stageUpperCase}_GOOGLE_CLIENT_ID`
          )
          .toString(),
        clientSecret: props
          .allStagesSecrets!.secretValueFromJson(
            `${props.stageUpperCase}_GOOGLE_CLIENT_SECRET`
          )
          .toString(),
        scopes: ['email'],
        attributeMapping: {
          email: ProviderAttribute.GOOGLE_EMAIL,
          custom: {
            email_verified: ProviderAttribute.other('email_verified'),
          },
        },
      }
    )

    props.cognitoUserPoolClient = new UserPoolClient(
      this,
      constructId('cognito-user-pool-client', props),
      {
        userPool: props.cognitoUserPool,
        disableOAuth: false,
        oAuth: {
          callbackUrls: [props.cognitoRedirectSignInUrl],
          logoutUrls: [props.cognitoRedirectSignOutUrl],
        },
        supportedIdentityProviders: [
          UserPoolClientIdentityProvider.FACEBOOK,
          UserPoolClientIdentityProvider.GOOGLE,
        ],
        readAttributes: new ClientAttributes().withStandardAttributes({
          email: true,
          emailVerified: true,
          phoneNumber: true,
        }),
        writeAttributes: new ClientAttributes().withStandardAttributes({
          email: true,
          phoneNumber: true,
        }),
        accessTokenValidity: Duration.minutes(10),
        idTokenValidity: Duration.minutes(10),
        refreshTokenValidity: Duration.minutes(60),
      }
    )
    props.cognitoUserPoolClient.node.addDependency(facebookProvider)
    props.cognitoUserPoolClient.node.addDependency(googleProvider)

    const auth = new Auth(this, constructId('cognito-authorization', props), {
      cognito: {
        userPool: props.cognitoUserPool,
        userPoolClient: props.cognitoUserPoolClient,
      },
    })

    props.cognitoCfnIdentityPool = auth.cognitoCfnIdentityPool
  }
}
