/* eslint-disable no-new */
import { App, Stack } from '@serverless-stack/resources'
import * as es from 'aws-cdk-lib/aws-opensearchservice'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as iam from 'aws-cdk-lib/aws-iam'
import { AppStackProps } from './AppStackProps'
import { constructId } from './index'

export default class ElasticStack extends Stack {
  constructor(scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const domainAccessPolicy = new iam.PolicyStatement({
      actions: ['*'],
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      principals: [new iam.ServicePrincipal('lambda.amazonaws.com')],
    })

    const domainProps: es.DomainProps = {
      version: es.EngineVersion.ELASTICSEARCH_7_1,
      removalPolicy: RemovalPolicy.DESTROY,
      vpc: props.vpc,
      securityGroups: props.sgForIsolatedSubnet
        ? [props.sgForIsolatedSubnet]
        : [],
      vpcSubnets: [
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          availabilityZones: [
            props.vpc?.availabilityZones[0] ?? '',
            props.vpc?.availabilityZones[1] ?? '',
          ],
        },
      ],
      zoneAwareness: {
        enabled: true,
        availabilityZoneCount: 2,
      },
      capacity: {
        masterNodes: 3,
        masterNodeInstanceType: 't3.small.search',
        dataNodes: 2,
        dataNodeInstanceType: 't3.small.search',
      },
      accessPolicies: [domainAccessPolicy],
    }
    props.esDomain = new es.Domain(
      this,
      constructId('es-domain', props),
      domainProps
    )

    const hostedZoneId =
      props.allStagesSecrets
        ?.secretValueFromJson(`${props.stageUpperCase}_HOSTED_ZONE_ID`)
        .toString() ?? ''

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      constructId('hosted-zone', props),
      {
        zoneName: props.hostedZoneName,
        hostedZoneId,
      }
    )

    new route53.CnameRecord(this, props.esEndpointCname, {
      recordName: `${props.domainStagePrefix}es`,
      domainName: props.esDomain.domainEndpoint,
      ttl: Duration.seconds(10),
      zone: hostedZone,
    })

    // this.exportValue(props.esDomain, {name: 'esDomain'})
    // this.exportValue(props.esDomain.domainArn, {name: 'domainArn'})

    // const bastionHost = new ec2.BastionHostLinux(this, 'BastionHostLinux', {
    //   vpc: props.vpc,
    //   subnetSelection: {
    //     subnetType: ec2.SubnetType.PUBLIC
    //   },
    //   securityGroup: props.elasticSecurityGroup,
    //   instanceName: 'BastionHost',
    //   instanceType: ec2.InstanceType.of(InstanceClass.T3, InstanceSize.NANO),
    //   machineImage: ec2.MachineImage.latestAmazonLinux()
    // })
    // bastionHost.allowSshAccessFrom(ec2.Peer.ipv4('94.203.155.114/32'))
    // bastionHost.instance.instance.addPropertyOverride('KeyName', 'bastion-key-name')
    //
    // domain.grantRead(bastionHost)
    // domain.grantWrite(bastionHost)
  }
}
