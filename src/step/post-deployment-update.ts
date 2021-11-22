import { logger } from 'common/logger'
import { DescribeClientVpnEndpointsCommand, EC2Client } from '@aws-sdk/client-ec2'
import { ChangeResourceRecordSetsCommand, Route53Client } from '@aws-sdk/client-route-53'
import { StepFunctionResult, StepFunctionResultSuccess } from './index'

/**
 * Post CDK deployment update lambda step function. Not everything is possible with CDK at the moment.
 * These SDK calls are required to finalize stack configuration.
 */
export const handler: () => Promise<StepFunctionResult> = async () => {
  await logger.info('Step function called to setup vpn.')

  const client = new EC2Client({ region: process.env.REGION })
  const command = new DescribeClientVpnEndpointsCommand({})
  const endpoints = await client.send(command)

  if (endpoints.ClientVpnEndpoints?.length) {
    const clientVpnEndpoint = endpoints.ClientVpnEndpoints[0]
    const dnsName = clientVpnEndpoint.DnsName
    const dnsNameWithPrefix = `${Math.floor(Math.random() * 99999)}${dnsName?.substring(1)}`

    const route53Client = new Route53Client({ region: process.env.REGION })
    const command = new ChangeResourceRecordSetsCommand({
      HostedZoneId: process.env.HOSTED_ZONE_ID,
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: process.env.VPN_DOMAIN!,
            Type: 'CNAME',
            TTL: 300,
            ResourceRecords: [{ Value: dnsNameWithPrefix }]
          }
        }]
      }
    })
    await route53Client.send(command)
  }

  const response: StepFunctionResult = {
    status: StepFunctionResultSuccess
  }
  return response
}
