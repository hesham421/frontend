import { z } from 'zod';
import type { CreateLegalEntityRequest, UpdateLegalEntityRequest } from '../api/legalEntitiesApi';

// F3/SCR-ORG-001 — Legal Entities validation rules.
//
// Business Code (legalEntityCode) — RULE-ORG-011, RULE-ORG-012, RULE-ORG-013,
// RULE-ORG-014: system-generated via NumberingEngine, immutable after first
// save, and rejected if present in an Update payload. Nothing to encode here —
// CreateLegalEntityRequest/UpdateLegalEntityRequest (legalEntitiesApi.ts)
// already have no legalEntityCode field at all, so the DTO shape itself is
// the enforcement (F3-BC-RULE-1..3: field is display-only on both forms).
// RULE-ORG-012's sequence-conflict case is a 409 raised by the server during
// generation — no client field exists to validate against it.
//
// RULE-ORG-001, RULE-ORG-002 — cross-entity deactivation guards (active
// Branches / active ProfitCenters referencing this Legal Entity). Both are
// server-enforced 409s surfaced via the deactivate action; there is no
// client-checkable field — isActive itself isn't part of this create/update
// form, so nothing is modeled here.
//
// RULE-ORG-015 — nameAr/nameEn uniqueness within parent scope is
// server-enforced (409); no client-side pre-check declared per SRS (no
// async on-blur uniqueness lookup is implemented — not specified/required).
//
// RULE-ORG-016 — audit fields (createdBy/createdAt/updatedBy/updatedAt) are
// never sent by the client; already true since CreateLegalEntityRequest/
// UpdateLegalEntityRequest carry no audit fields.
const nameArSchema = z.string().min(1, 'Arabic name is required.');
const nameEnSchema = z.string().min(1, 'English name is required.');
const entityTypeIdSchema = z.string().min(1, 'Entity type is required.');
const notesSchema = z.string().optional();

export const createLegalEntitySchema = z.object({
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  entityTypeId: entityTypeIdSchema,
  notes: notesSchema,
}) satisfies z.ZodType<CreateLegalEntityRequest>;
export type CreateLegalEntityFormValues = z.infer<typeof createLegalEntitySchema>;

export const updateLegalEntitySchema = z.object({
  nameAr: nameArSchema.optional(),
  nameEn: nameEnSchema.optional(),
  entityTypeId: entityTypeIdSchema.optional(),
  notes: notesSchema,
}) satisfies z.ZodType<UpdateLegalEntityRequest>;
export type UpdateLegalEntityFormValues = z.infer<typeof updateLegalEntitySchema>;
