import { QueryCommandInput } from '@aws-sdk/lib-dynamodb/dist-types/ts3.4'
import { emptyEntityObject, EntityObject, EntityType, MaybeRecord } from '../index'
import { BaseEntity } from '../BaseEntity'
import { SystemInformation } from '../../shared/admin/system'

export class SystemInformationEntity extends BaseEntity<SystemInformation> {
  entity: EntityObject<SystemInformation> = emptyEntityObject<SystemInformation>()

  async save (systemInformation: SystemInformation): Promise<SystemInformation> {
    this.entity = {
      pk: EntityType.SYSTEM_INFORMATION,
      sk: EntityType.SYSTEM_INFORMATION,
      data: systemInformation
    }

    await this.documentClient.put({
      ...super.withTable(),
      Item: this.entity
    })

    return systemInformation
  }

  async load (): Promise<MaybeRecord<SystemInformation>> {
    const queryCommand: QueryCommandInput = {
      ...super.withTable(),
      KeyConditionExpression: '#pk = :pk_val',
      ExpressionAttributeNames: {
        '#pk': 'pk'
      },
      ExpressionAttributeValues: {
        ':pk_val': EntityType.SYSTEM_INFORMATION
      }
    }

    return await super.singleResultOrError(queryCommand)
  }
}
