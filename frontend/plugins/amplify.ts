import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth'
import awsConfig from './../aws-config.json'
import '@aws-amplify/ui-vue'

Amplify.configure({
  Auth: {
    region: awsConfig.region,
    userPoolId: awsConfig.cognitoUserPoolId,
    userPoolWebClientId: awsConfig.cognitoUserPoolClientId,
    identityPoolId: awsConfig.cognitoIdentityPoolId,
  },

  API: {
    endpoints: [
      {
        name: awsConfig.restApiName,
        endpoint: `https://${awsConfig.restApiEndpointCname}/${awsConfig.restApiPath}/`,
        region: awsConfig.region,
        custom_header: async () => {
          return {
            Authorization: `Bearer ${(await Auth.currentSession())
              .getIdToken()
              .getJwtToken()}`,
          }
        },
      },
    ],
  },
  oauth: {
    domain: `${awsConfig.cognitoDomainPrefix}.auth.${awsConfig.region}.amazoncognito.com`,
    scope: [
      'phone',
      'email',
      'profile',
      'openid',
      'aws.cognito.signin.user.admin',
    ],
    redirectSignIn: awsConfig.cognitoRedirectSignInUrl,
    redirectSignOut: awsConfig.cognitoRedirectSignOutUrl,
    responseType: 'code',
  },
})
