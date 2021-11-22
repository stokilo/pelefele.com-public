#!/usr/bin/env node

import fs from 'fs'
import * as path from 'path'
import * as child from 'child_process'
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

if (!argv.env) {
  console.info('Argument --env is mandatory, skipping.')
  process.exit(1)
}

const secretConfigs = await fetchAwsCloudflareSecretConfig()
await uploadWorker(secretConfigs, argv.env)

/**
 * Upload static website to worker instance.
 */
async function uploadWorker (config, env) {
  console.info(`Deploying to worker instance on environment [${env}] ...`)
  await child.exec(`node ./node_modules/@cloudflare/wrangler/run-wrangler.js publish --env ${env}`,
    {
      env: {
        ...process.env,
        CF_ACCOUNT_ID: config[`${env}_CLOUDFLARE_ACCOUNT_ID`],
        CF_API_TOKEN: config[`${env}_CLOUDFLARE_API_TOKEN`]
      }
    }, function (error, stdout, stderr) {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
      }
      console.log(`stdout: ${stdout}`)
    })
}

/**
 * Fetch account level secret. Extract cloudflare secret values from it.
 */
async function fetchAwsCloudflareSecretConfig () {
  try {
    const sstConfig = fs.readFileSync(path.normalize('../sst.json')).toJSON()
    const client = new SecretsManagerClient({ region: sstConfig.region })

    const secretValue = (await client.send(
      new GetSecretValueCommand({ SecretId: 'all-stages/pelefele' }))
    ).SecretString

    return JSON.parse(secretValue)
  } catch (e) {
    console.info('SST stack must be deployed and sst.json present in the root of the project')
    console.info('AWS credentials must be present or SSO session active.')
    console.error(e)
    process.exit(1)
  }
}
