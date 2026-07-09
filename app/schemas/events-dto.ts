import { z } from "zod";
import { resticBackupProgressMetricsSchema, resticBackupRunSummarySchema } from "@zerobyte/core/restic";

const backupEventStatusSchema = z.enum(["success", "error", "stopped", "warning"]);

const backupEventBaseSchema = z.object({
	scheduleId: z.string(),
	volumeName: z.string(),
	repositoryName: z.string(),
});

const organizationScopedSchema = z.object({
	organizationId: z.string(),
});

const dumpStartedEventSchema = z.object({
	repositoryId: z.string(),
	snapshotId: z.string(),
	path: z.string(),
	filename: z.string(),
});
const backupStartedEventSchema = backupEventBaseSchema;

export const backupProgressEventSchema = backupEventBaseSchema.extend(resticBackupProgressMetricsSchema.shape);

const backupCompletedEventSchema = backupEventBaseSchema.extend({
	status: backupEventStatusSchema,
	summary: resticBackupRunSummarySchema.optional(),
});

const serverBackupStartedEventSchema = organizationScopedSchema.extend(backupStartedEventSchema.shape);

const serverBackupProgressEventSchema = organizationScopedSchema.extend(backupProgressEventSchema.shape);

const serverBackupCompletedEventSchema = organizationScopedSchema.extend(backupCompletedEventSchema.shape);

const serverDumpStartedEventSchema = organizationScopedSchema.extend(dumpStartedEventSchema.shape);

export type BackupProgressEventDto = z.infer<typeof backupProgressEventSchema>;
export type ServerBackupStartedEventDto = z.infer<typeof serverBackupStartedEventSchema>;
export type ServerBackupProgressEventDto = z.infer<typeof serverBackupProgressEventSchema>;
export type ServerBackupCompletedEventDto = z.infer<typeof serverBackupCompletedEventSchema>;
export type ServerDumpStartedEventDto = z.infer<typeof serverDumpStartedEventSchema>;
