/* eslint-disable no-new */
import { App, Stack } from '@serverless-stack/resources'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as ssm from '@aws-cdk/aws-ssm'
import { AppStackProps } from './AppStackProps'
import { constructId, constructName } from './index'

export default class VpnStack extends Stack {
  constructor (scope: App, id: string, props: AppStackProps) {
    super(scope, id, props)

    const clientCertToken = ssm.StringParameter.valueForStringParameter(
      this, 'client-cert-parameter')
    const serverCertToken = ssm.StringParameter.valueForStringParameter(
      this, 'server-cert-parameter')

    props.vpnEndpoint = new ec2.ClientVpnEndpoint(this, constructId('vpn-endpoint', props), {
      cidr: '10.17.0.0/22',
      clientCertificateArn: clientCertToken,
      serverCertificateArn: serverCertToken,
      vpc: props.vpc!,
      splitTunnel: true,
      logging: false,
      selfServicePortal: false,
      dnsServers: ['10.17.0.2'],
      securityGroups: [props.sgForIsolatedSubnet!],
      vpcSubnets: {
        subnetGroupName: constructName('subnet-isolated', props),
        availabilityZones: [props.vpc!.availabilityZones[0]]
      }
    })

    // const bastionHost = new ec2.BastionHostLinux(this, 'BastionHostLinux', {
    //   vpc: props.vpc,
    //   subnetSelection: {
    //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED
    //   },
    //   securityGroup: props.sgForIsolatedSubnet,
    //   instanceName: 'BastionHost',
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
    //   machineImage: ec2.MachineImage.latestAmazonLinux()
    // })
    // // bastionHost.allowSshAccessFrom(ec2.Peer.ipv4('94.203.155.114/32'))
    // bastionHost.instance.instance.addPropertyOverride('KeyName', 'bastion-key-name')
    //
  }
}
