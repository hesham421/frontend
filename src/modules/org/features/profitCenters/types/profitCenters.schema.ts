import { z } from 'zod';
import type { CreateProfitCenterRequest, UpdateProfitCenterRequest } from '../api/profitCentersApi';

// F3/SCR-ORG-006 — Profit Centers validation rules.
//
// RULE-ORG-002 — deactivation guard: this rule blocks deactivation of the
// parent LegalEntity when active ProfitCenters reference it. It is a
// server-enforced 409 surfaced on the LegalEntity's own deactivate action
// (legalEntities.schema.ts), not a field or action on this entity's own
// create/update form — nothing to encode here, cross-reference only.
//
// Business Code (profitCenterCode) — RULE-ORG-011, RULE-ORG-012, RULE-ORG-013,
// RULE-ORG-014: system-generated via NumberingEngine, immutable after first
// save, and rejected if present in an Update payload. Nothing to encode here
// — CreateProfitCenterRequest/UpdateProfitCenterRequest (profitCentersApi.ts)
// already have no profitCenterCode field at all, so the DTO shape itself is
// the enforcement (F3-BC-RULE-1..3: field is display-only on both forms).
// RULE-ORG-012's sequence-conflict case is a 409 raised by the server during
// generation — no client field exists to validate against it.
//
// RULE-ORG-015 — nameAr/nameEn uniqueness within parent scope is
// server-enforced (409); no client-side pre-check declared per SRS (no
// async on-blur uniqueness lookup is implemented — not specified/required).
//
// RULE-ORG-016 — audit fields (createdBy/createdAt/updatedBy/updatedAt) are
// never sent by the client; already true since CreateProfitCenterRequest/
// UpdateProfitCenterRequest carry no audit fields.
//
// legalEntityFk — required (number) FK on Create, correctly absent from
// Update per profit-center-management.md (immutable parent FK after
// creation).
const nameArSchema = z.string().min(1, 'Arabic name is required.');
const nameEnSchema = z.string().min(1, 'English name is required.');
const legalEntityFkSchema = z.number();
const notesSchema = z.string().optional();

export const createProfitCenterSchema = z.object({
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  legalEntityFk: legalEntityFkSchema,
  notes: notesSchema,
}) satisfies z.ZodType<CreateProfitCenterRequest>;
export type CreateProfitCenterFormValues = z.infer<typeof createProfitCenterSchema>;

export const updateProfitCenterSchema = z.object({
  nameAr: nameArSchema.optional(),
  nameEn: nameEnSchema.optional(),
  notes: notesSchema,
}) satisfies z.ZodType<UpdateProfitCenterRequest>;
export type UpdateProfitCenterFormValues = z.infer<typeof updateProfitCenterSchema>;
