/* eslint-disable no-new */
import { App, Stack } from '@serverless-stack/resources'
import * as rds from '@aws-cdk/aws-rds'
import * as ec2 from '@aws-cdk/aws-ec2'
import { SubnetType } from '@aws-cdk/aws-ec2'
import * as route53 from '@aws-cdk/aws-route53'
import { Duration, RemovalPolicy } from '@aws-cdk/core'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export default class RdsStack extends Stack {
  constructor (scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const subnetGroup = new rds.SubnetGroup(this, constructId('rds-subnet-group', props), {
      description: 'Subnet group for RDS',
      vpc: props.vpc!,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      removalPolicy: RemovalPolicy.DESTROY
    })

    const cluster = new rds.DatabaseCluster(this, constructId('aurora-cluster', props), {
      clusterIdentifier: 'postgres-aurora-cluster',
      instanceIdentifierBase: 'postgres-instance',
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_12_4 }),
      credentials: rds.Credentials.fromGeneratedSecret('rdsadmin'),
      instances: 1,
      instanceProps: {
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        },
        vpc: props.vpc!
      },
      removalPolicy: RemovalPolicy.DESTROY,
      defaultDatabaseName: 'dbo',
      deletionProtection: false,
      subnetGroup
    }
    )

    const privateHostedZone = new route53.PrivateHostedZone(this, constructId('private-hosted-zone', props), {
      zoneName: 'rds.com',
      vpc: props.vpc!
    })

    new route53.CnameRecord(this, 'reader.rds.com', {
      recordName: 'reader',
      domainName: cluster.clusterReadEndpoint.hostname,
      ttl: Duration.seconds(10),
      zone: privateHostedZone
    })

    new route53.CnameRecord(this, 'writer.rds.com', {
      recordName: 'writer',
      domainName: cluster.clusterEndpoint.hostname,
      ttl: Duration.seconds(10),
      zone: privateHostedZone
    })
  }
}
