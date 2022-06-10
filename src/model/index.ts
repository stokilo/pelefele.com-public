export enum EntityType {
  SYSTEM_INFORMATION = 'SYSTEM_INFORMATION',
  LISTING = 'LISTING',
  ES_INDEXED_LISTING = 'ES_INDEXED_LISTING',
}

/**
 * Entities in our DynamoDb model are stored with
 * PK - partition key
 * SK - sort key
 * data - serialized model object data
 *  PK - copy of PK
 *  SK - copy of SK
 *
 */
export type EntityObject<T> = {
  pk: string
  sk: string
  gsi1pk?: string
  gsi1sk?: string
  data?: T
}

export function emptyEntityObject<T>(): EntityObject<T> {
  return {
    pk: '',
    sk: '',
  }
}

export function newEntityObjectWithPkSk<T>(
  data: T & { pk: string; sk: string }
): EntityObject<T> {
  return {
    pk: data.pk,
    sk: data.sk,
    data,
  }
}

export type MaybeRecord<T> = {
  found: boolean
  data: T
}
