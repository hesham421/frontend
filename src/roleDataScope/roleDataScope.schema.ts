import { z } from 'zod';
import { DATA_ACCESS_LEVELS } from './dataAccessLevel';
import type { CreateSecRoleBranchRequest, SecRoleBranchDto, UpdateSecRoleBranchRequest } from './roleDataScopeApi';

// F3/SCR-SEC-007 — RULE-SEC-035. The corrected 3-value enum (see
// dataAccessLevel.ts) is what actually prevents a save failure at the form
// layer — a naively-copied ('BRANCH'|'CHILDREN'|'ALL') schema would pass
// client-side yet reject on every server round trip.
const dataAccessLevelSchema = z.enum(DATA_ACCESS_LEVELS);

export const updateRoleDataScopeSchema = z.object({
  dataAccessLevel: dataAccessLevelSchema,
}) satisfies z.ZodType<UpdateSecRoleBranchRequest>;
export type UpdateRoleDataScopeFormValues = z.infer<typeof updateRoleDataScopeSchema>;

export const createRoleDataScopeSchema = z.object({
  roleIdFk: z.number(),
  branchIdFk: z.number(),
  dataAccessLevel: dataAccessLevelSchema,
}) satisfies z.ZodType<CreateSecRoleBranchRequest>;
export type CreateRoleDataScopeFormValues = z.infer<typeof createRoleDataScopeSchema>;

// RULE-SEC-036 — CREATE only (the composite PK makes this structurally
// impossible on UPDATE). No mandatory pre-flight fetch is added for this
// check (would cost an extra round trip no confirmed screen behavior calls
// for) — this helper is for callers that already hold the existing-scopes
// list in memory; otherwise the ON_SUBMIT 409/422 -> ERR-SEC-036 route
// (lib/errors/secErrors.ts) is authoritative.
export function isDuplicateRoleBranchAssignment(
  existing: Pick<SecRoleBranchDto, 'roleIdFk' | 'branchIdFk'>[],
  roleIdFk: number,
  branchIdFk: number,
): boolean {
  return existing.some((e) => e.roleIdFk === roleIdFk && e.branchIdFk === branchIdFk);
}
