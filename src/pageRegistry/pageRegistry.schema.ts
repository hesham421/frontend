import { z } from 'zod';
import type { CreatePageRequest, UpdatePageRequest } from './pageRegistryApi';

// F3/SCR-SEC-005 — RULE-SEC-046. pageCode is CREATE-only and immutable
// (matches UpdatePageRequest's real shape, which has no pageCode field);
// uniqueness of pageCode/route is ON_SUBMIT/server-only. Server normalizes
// pageCode to uppercase — client mirrors it for display only.
const pageCodeSchema = z
  .string()
  .min(2, 'Page code must be at least 2 characters.')
  .max(50, 'Page code must be 50 characters or fewer.')
  .regex(/^[A-Z0-9_]+$/, 'Page code must contain only uppercase letters, numbers, and underscores.');

const routeSchema = z
  .string()
  .max(200, 'Route path must be 200 characters or fewer.')
  .regex(/^\/[a-zA-Z0-9/_-]+$/, 'Route path must start with "/" and contain only letters, numbers, "-", "_", and "/".');

const nameSchema = z.string().min(1, 'This field is required.');

export const createPageSchema = z.object({
  pageCode: pageCodeSchema,
  nameAr: nameSchema,
  nameEn: nameSchema,
  route: routeSchema,
  icon: z.string().optional(),
  module: z.string().optional(),
  parentId: z.number().optional(),
  displayOrder: z.number().optional(),
  active: z.boolean().optional(),
  description: z.string().optional(),
  suppressPermissionTypes: z.array(z.string()).optional(),
}) satisfies z.ZodType<CreatePageRequest>;
export type CreatePageFormValues = z.infer<typeof createPageSchema>;

export const updatePageSchema = z.object({
  nameAr: nameSchema,
  nameEn: nameSchema,
  route: routeSchema,
  icon: z.string().optional(),
  module: z.string().optional(),
  parentId: z.number().optional(),
  displayOrder: z.number().optional(),
  description: z.string().optional(),
}) satisfies z.ZodType<UpdatePageRequest>;
export type UpdatePageFormValues = z.infer<typeof updatePageSchema>;

// RULE-SEC-046 parentId — self-reference is the one client-checkable
// sub-case on UPDATE: exclude the record's own id from the parent picker's
// options (existence against a real page is server-authoritative).
export function excludeSelfFromParentOptions<T extends { id: number }>(pages: T[], ownId: number | undefined): T[] {
  return ownId === undefined ? pages : pages.filter((p) => p.id !== ownId);
}
