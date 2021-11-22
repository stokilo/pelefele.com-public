
export interface MigrationJob {
  type(): string
  migrate () : Promise<boolean>
}

export enum AdminPanelActions {
  STATUS = 'status',
  MIGRATE = 'migrate',
  PROCESS_SQS_DLQ = 'sqsdlq',
  REINDEX = 'reindex'
}

export function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
