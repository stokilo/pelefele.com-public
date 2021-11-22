import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler
} from 'aws-lambda'
import { http200WithJSONBody } from 'rest/index'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  return http200WithJSONBody(JSON.stringify({ }))
}
