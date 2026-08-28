import { z } from 'zod';
import type { CreateSecUserProfileRequest, UpdateSecUserProfileRequest } from './userProfilesApi';

// F3/SCR-SEC-006 — RULE-SEC-034. branchIdFk is required; the picker's own
// options already come from Organization's live active-branch list
// (useOrganizationStore), so an inactive/nonexistent branch is structurally
// unreachable in normal use — the cross-module active-branch check
// (XM-SEC-001) remains server-authoritative for the race-condition case
// (branch deactivated between page load and submit), surfaced via
// ERR-SEC-034 (lib/errors/secErrors.ts) on mutation failure.
const branchIdFkSchema = z.number();

export const updateUserProfileSchema = z.object({
  branchIdFk: branchIdFkSchema,
  fullNameAr: z.string().optional(),
  fullNameEn: z.string().optional(),
  preferredLang: z.string().optional(),
  employeeIdFk: z.number().optional(),
}) satisfies z.ZodType<UpdateSecUserProfileRequest>;
export type UpdateUserProfileFormValues = z.infer<typeof updateUserProfileSchema>;

export const createUserProfileSchema = updateUserProfileSchema.extend({
  userIdFk: z.number(),
}) satisfies z.ZodType<CreateSecUserProfileRequest>;
export type CreateUserProfileFormValues = z.infer<typeof createUserProfileSchema>;
