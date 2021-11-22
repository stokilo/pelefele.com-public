import { logger } from 'common/logger'
import { SystemAdminService } from '../admin/system-admin-service'
import {
  StepFunctionMigrationError,
  StepFunctionMigrationOkAllDone,
  StepFunctionMigrationOkContinue,
  StepFunctionMigrationResult
} from './index'

/**
 * This is step function lambda that performs various system migrations (database, es, s3).
 */
export const handler: () => Promise<StepFunctionMigrationResult> = async () => {
  await logger.info('Step function for stack migrations')

  const systemAdminService = new SystemAdminService()
  await systemAdminService.showMigrations()

  const response: StepFunctionMigrationResult = {
    status: StepFunctionMigrationOkAllDone
  }

  try {
    const hasNext = await systemAdminService.migrateNext()
    response.status = hasNext ? StepFunctionMigrationOkContinue : StepFunctionMigrationOkAllDone
  } catch (err) {
    logger.error(err)
    response.status = StepFunctionMigrationError
  }
  return response
}
