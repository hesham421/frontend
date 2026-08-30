import { z } from 'zod';
import type { CreateRoleRequest, PageAssignmentDto, UpdateRoleRequest } from '../api/rolesApi';

// F3/SCR-SEC-003 — RULE-SEC-048. roleCode is CREATE-only and immutable
// (matches UpdateRoleRequest's real shape, which has no roleCode field at
// all); uniqueness of both fields is ON_SUBMIT/server-only.
const roleCodeSchema = z
  .string()
  .regex(/^[A-Z][A-Z0-9_]*$/, 'Role code must start with a letter and contain only uppercase letters, numbers, and underscores.');
const roleNameSchema = z
  .string()
  .min(1, 'Role name is required.')
  .max(60, 'Role name must be 60 characters or fewer.');

export const createRoleSchema = z.object({
  roleCode: roleCodeSchema,
  roleName: roleNameSchema,
  description: z.string().optional(),
  active: z.boolean().optional(),
}) satisfies z.ZodType<CreateRoleRequest>;
export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  roleName: roleNameSchema,
  description: z.string().optional(),
  active: z.boolean().optional(),
}) satisfies z.ZodType<UpdateRoleRequest>;
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

// RULE-SEC-043 — matrix UI only ever renders these 3 togglable checkboxes per
// row (VIEW excluded per RULE-SEC-042, auto-added + non-removable server-side,
// structurally never toggleable in this enum). ON_SUBMIT defense-in-depth on
// top of the UI's own structural enforcement.
export const rolePagePermissionSchema = z.enum(['CREATE', 'UPDATE', 'DELETE']);
export type CrudPermission = z.infer<typeof rolePagePermissionSchema>;

export const pageAssignmentSchema = z.object({
  pageCode: z.string().min(1),
  permissions: z.array(rolePagePermissionSchema),
}) satisfies z.ZodType<PageAssignmentDto>;

// RULE-SEC-045(a) — self-copy is the one client-checkable sub-case: the
// source-role picker must exclude the target role's own id from its options.
// The (b) empty-source case has no client pre-check; surfaced via
// ERR-SEC-045-EMPTY on mutation failure (lib/errors/secErrors.ts).
export function excludeSelfFromCopySources<T extends { id: number }>(roles: T[], targetRoleId: number): T[] {
  return roles.filter((r) => r.id !== targetRoleId);
}
