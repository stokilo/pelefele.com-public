export const StepFunctionResultSuccess = 'step-function-result-success'
export const StepFunctionResultFailure = 'step-function-result-failure'

export type StepFunctionResult = {
  status: typeof StepFunctionResultSuccess | typeof StepFunctionResultFailure
}

// Migration can be executed in multiple steps because of lambda time limit.
export const StepFunctionMigrationOkAllDone = 'migration-ok-all-done'
export const StepFunctionMigrationOkContinue = 'migration-ok-continue'
export const StepFunctionMigrationError = 'migration-error'

export type StepFunctionMigrationResult = {
  status: typeof StepFunctionMigrationOkAllDone |
          typeof StepFunctionMigrationOkContinue |
          typeof StepFunctionMigrationError
}
