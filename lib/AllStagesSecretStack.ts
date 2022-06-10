/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sst from '@serverless-stack/resources'
import * as SM from 'aws-cdk-lib/aws-secretsmanager'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export default class AllStagesSecretStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props: AppStackProps) {
    super(scope, id, props)

    props.allStagesSecrets = SM.Secret.fromSecretNameV2(
      this,
      constructId('all-stages-secret', props),
      props.allStagesSecretName
    )
  }
}
