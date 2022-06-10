// eslint-disable-next-line camelcase
import https_1 from 'https'
// eslint-disable-next-line camelcase
import http_1 from 'http'
import { Client, Connection } from '@elastic/elasticsearch'
import { sign } from 'aws4'
import {
  awsGetCredentials,
  createAWSConnection,
} from '@acuris/aws-es-connection'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const ssmClient = new SSMClient({ region: process.env.REGION })

export default class EsClient {
  readonly region

  constructor(region: string) {
    this.region = region
  }

  /**
   * Elasticsearch client for application domain (http://*es.awss.ws)
   */
  public async getEsClient(): Promise<Client> {
    const awsCredentials = await awsGetCredentials()
    const connection = createAWSConnection(awsCredentials)
    connection.Connection = this.generateAWSConnectionClass(awsCredentials)

    const command = new GetParameterCommand({
      Name: `${process.env.APP_OUTPUT_PARAMETER_NAME}`,
    })
    const appOutput = await ssmClient.send(command)
    const appOutputJson = JSON.parse(appOutput.Parameter?.Value!)
    // host header i.e. local.es.awss.ws but esDomainUrl: http://local.es.awss.ws
    const esHostName = appOutputJson.esEndpointCname
    const esDomainUrl = `http://${appOutputJson.esEndpointCname}`

    return new Client({
      ...connection,
      node: esDomainUrl,
      headers: {
        Host: esHostName,
      },
    })
  }

  /**
   * ES connection class with request signing
   */
  private generateAWSConnectionClass(credentials: any) {
    const _region = this.region
    return class AWSConnection extends Connection {
      constructor(opts: any) {
        super(opts)
        this.makeRequest = this.signedRequest
      }

      signedRequest(reqParams: any) {
        // eslint-disable-next-line no-void
        const request =
          (reqParams === null || reqParams === void 0
            ? void 0
            : reqParams.protocol) === 'https:'
            ? https_1.request
            : http_1.request
        return request(
          sign(
            Object.assign(Object.assign({ region: _region }, reqParams), {
              service: 'es',
            }),
            credentials
          )
        )
      }
    }
  }
}
