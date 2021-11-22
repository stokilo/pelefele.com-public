import * as zod from 'zod'

export const ValidationSchema = zod.object({
  passed: zod.boolean(),
  errors: zod.record(zod.string())
})

export const StatusSchema = zod.object({
  success: zod.boolean(),
  errorMessage: zod.string().optional()
})

export const FormSchema = zod.object({
  status: StatusSchema,
  validation: ValidationSchema
})

export type Status = zod.TypeOf<typeof StatusSchema>
export type Validation = zod.TypeOf<typeof ValidationSchema>
export type Form = zod.TypeOf<typeof FormSchema>

export const ValidationOK = () : Validation => {
  return {
    passed: true,
    errors: {}
  }
}
export const StatusOK = () : Status => {
  return {
    success: true
  }
}
export const StatusNOTOK = () : Status => {
  return {
    success: false
  }
}
