import { z } from 'zod';
import type { CreateUserRequest, UpdateUserRequest } from './usersApi';

// F3/SCR-SEC-002 — RULE-SEC-049. Uniqueness (case-insensitive) and the
// delete-protection/default-role notes are server round-trip only (no
// client pre-check endpoint) — surfaced via ERR-SEC-049-USERNAME /
// ERR-SEC-049-DELETE (lib/errors/secErrors.ts) on mutation failure.
const usernameSchema = z.string().min(3).max(80);

export const createUserSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1),
}) satisfies z.ZodType<CreateUserRequest>;
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  password: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
  roleNames: z.array(z.string()).optional(),
}) satisfies z.ZodType<UpdateUserRequest>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
