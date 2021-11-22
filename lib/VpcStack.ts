/* eslint-disable no-new */
import { App, Stack } from '@serverless-stack/resources'
import * as ec2 from '@aws-cdk/aws-ec2'
import { SubnetType } from '@aws-cdk/aws-ec2'
import { AppStackProps } from './AppStackProps'
import { constructId, constructName } from './index'

export default class VpcStack extends Stack {
  constructor (scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    props.vpc = new ec2.Vpc(this, constructId('vpc', props), {
      cidr: '10.16.0.0/16',
      natGateways: 0,
      maxAzs: 3,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: constructName('subnet-public', props),
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: constructName('subnet-isolated', props),
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
      ]
    })

    props.sgForIsolatedSubnet = new ec2.SecurityGroup(this, constructId('vpc-sg-for-isolated-subnet', props), {
      vpc: props.vpc,
      securityGroupName: constructName('vpc-sg-for-isolated-subnet', props),
      allowAllOutbound: true
    })

    props.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.icmpPing(), 'ICMP from VPC')
    props.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(22), '22 from VPC')
    props.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(80), '80 from VPC')
    props.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(443), '443 from VPC')
    props.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.tcp(53), 'DNS TCP from VPC')
    props.sgForIsolatedSubnet.addIngressRule(ec2.Peer.ipv4('10.16.0.0/16'),
      ec2.Port.udp(53), 'DNS UDP from VPC')

    props.vpc.addGatewayEndpoint(constructId('s3-endpoint', props), {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{
        subnetType: SubnetType.PRIVATE_ISOLATED
      }]
    })

    props.vpc.addGatewayEndpoint(constructId('dynamodb-endpoint', props), {
      service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
      subnets: [{
        subnetType: SubnetType.PRIVATE_ISOLATED
      }]
    })

    props.vpc.addInterfaceEndpoint(constructId('ssm-interface-endpoint', props), {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      }
    })

    props.vpc.addInterfaceEndpoint(constructId('step-function-interface-endpoint', props), {
      service: ec2.InterfaceVpcEndpointAwsService.STEP_FUNCTIONS,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      }
    })

    props.vpc.addInterfaceEndpoint(constructId('sqs-interface-endpoint', props), {
      service: ec2.InterfaceVpcEndpointAwsService.SQS,
      subnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      }
    })
  }
}
