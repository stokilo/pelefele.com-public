#### What is it?

https://youtu.be/aVXvDcHRJEQ

pelefele.com - real estate application. Sample serverless application implemented using serverless stack and NuxtJs.

This is an upgrade of initial version that can be found here:

https://github.com/stokilo/cloud-spider-public

Project configure domains for API (awss.ws) and web app (pelefele.com). These domains are configured for DEV and PROD
environments with subdomains:

dev.pelefele.com (DEV) -> dev.api.awss.ws 

pelefele.com (PROD) -> api.awss.ws.


#### Preparation

1. AWS Secret config

Note: all credentials for this setup are stored under single AWS secret with name:

```/account/api/secrets```

Secret is not provisioned. Must be created by hand using AWS Console. Check values from ```doc/social.md``

Current list of required secret keys:

```
PROD_FACEBOOK_CLIENT_SECRET	d888888888888888888888888888889d
DEV_FACEBOOK_CLIENT_SECRET	d888888888888888888888888888889d
LOCAL_FACEBOOK_CLIENT_SECRET	d888888888888888888888888888889d

PROD_FACEBOOK_CLIENT_ID	444444444444862
DEV_FACEBOOK_CLIENT_ID	444444444444862
LOCAL_FACEBOOK_CLIENT_ID	444444444444862

PROD_GOOGLE_CLIENT_ID	323333333336-ifjasiofjaisfjjfisafiasjomihsj3q.apps.googleusercontent.com
DEV_GOOGLE_CLIENT_ID	323333333336-ifjasiofjaisfjjfisafiasjomihsj3q.apps.googleusercontent.com
LOCAL_GOOGLE_CLIENT_ID	323333333336-ifjasiofjaisfjjfisafiasjomihsj3q.apps.googleusercontent.com

PROD_GOOGLE_CLIENT_SECRET	ifiasjfiajsfiajsfi11sFZ-
DEV_GOOGLE_CLIENT_SECRET	ifiasjfiajsfiajsfi11sFZ-
LOCAL_GOOGLE_CLIENT_SECRET	ifiasjfiajsfiajsfi11sFZ-

PROD_CLOUDFLARE_ACCOUNT_ID	c597c88a0e327181e73929291901213f
DEV_CLOUDFLARE_ACCOUNT_ID	c597c88a0e327181e73929291901213f
LOCAL_CLOUDFLARE_ACCOUNT_ID	c597c88a0e327181e73929291901213f

PROD_CLOUDFLARE_ZONE_ID	239920390239032909023a91630db7c5
DEV_CLOUDFLARE_ZONE_ID	239920390239032909023a91630db7c5
LOCAL_CLOUDFLARE_ZONE_ID	239920390239032909023a91630db7c5

PROD_CLOUDFLARE_API_TOKEN	ESlgJ9Fy1w5pCVOn23192910jfasfojaamE6jUAp
DEV_CLOUDFLARE_API_TOKEN	ESlgJ9Fy1w5pCVOn23192910jfasfojaamE6jUAp
LOCAL_CLOUDFLARE_API_TOKEN	ESlgJ9Fy1w5pCVOn23192910jfasfojaamE6jUAp

PROD_HOSTED_ZONE_ID	2319239032j23OGQIKMIR
DEV_HOSTED_ZONE_ID	2319239032j23OGQIKMIR
LOCAL_HOSTED_ZONE_ID	2319239032j23OGQIKMIR

```


2. Check lib/vpn.md to setup OpenVpn connection to the VPC

3. Once connected install awscurl and check system status

```
awscurl --service execute-api https://dev.api.awss.ws/v1/admin/panel\?action\=status --region me-south-1
```

Dry run migration 0.0.1 number 2
```
awscurl --service execute-api https://dev.api.awss.ws/v1/admin/panel\?action\=migrate  --region me-south-1
```

#### Build

Project scrips executes sso.sh script to acquire short living auth tokens. Comment out this if you are using
hardcoded credentials in ~/.aws/credentials file. 

Install dependencies

```bash
$ ./yarn install
$ frontend/yarn install
```

#### Stage and prod deployment (includes backend and frontend)

```bash
$ ./yarn deploy-dev
$ ./yarn deploy-prod
```
#### Backend development with live lambda reload

```bash
$ ./yarn start
```

#### Run unit and integration tests

```bash
$ yarn test
$ yarn integ-test
```

#### Frontend development (localhost:3000)
```bash
$ frontend/yarn dev
```
