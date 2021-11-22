/** index creation, deleation, configuration, mappings**/
export interface EsIndexConfig {
  configureIndex(recreate: boolean) : Promise<boolean>
}
/** index search operations **/
export interface EsIndexSearch<T> {
  search(searchParams: {[key: string]: string}) : Promise<T>
}
/** index properties **/
export interface EsIndexProps {
  indexName() : string
}

class ListingsIndexProps implements EsIndexProps {
  indexName (): string {
    return 'listings-v1'
  }
}

class AddressesIndexProps implements EsIndexProps {
  indexName (): string {
    return 'addresses-v1'
  }
}

export const MAX_ES_INT = 2147483647

export const ADDRESSES_INDEX_PROPS = new AddressesIndexProps()
export const LISTINGS_INDEX_PROPS = new ListingsIndexProps()

export declare type EsAddressDocument = {
  pk: string,
  sk: string,
  city: string,
  street: string,
  location: string
}
