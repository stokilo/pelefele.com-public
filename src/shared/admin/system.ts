import * as zod from 'zod'

export const MigrationStatusSchema = zod.object({
  type: zod.string(),
  success: zod.boolean().optional(),
  migrationStart: zod.string().optional(),
  migrationEnd: zod.string().optional(),
})

export const SystemInformationSchema = zod.object({
  lastMigrationNumber: zod.number().default(0),
  stage: zod.string(),
  migrationHistory: zod.array(MigrationStatusSchema),
})

export type MigrationStatus = zod.TypeOf<typeof MigrationStatusSchema>
export type SystemInformation = zod.TypeOf<typeof SystemInformationSchema>
