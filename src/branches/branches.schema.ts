import { z } from 'zod';
import type { CreateBranchRequest, UpdateBranchRequest } from './branchesApi';

// F3/SCR-ORG-002 — Branches validation rules.
//
// RULE-ORG-003, RULE-ORG-004, RULE-ORG-005 — deactivation guards (active
// Departments / active CostCenters / active LocationSites referencing this
// Branch). All three are server-enforced 409s surfaced via the deactivate
// action; there is no client-checkable field — isActive itself isn't part
// of this create/update form, so nothing is modeled here.
//
// RULE-ORG-018 — Branch must belong to an active LegalEntity. The
// legalEntityFk picker is already restricted to isActive=true records by
// useLegalEntitiesOptions (src/legalEntities/hooks.ts, filters:
// [{ field: 'isActive', operator: 'EQ', value: true }]), established in F2.
// This rule is satisfied structurally by that existing query filter — no
// new filtering logic is added here, only the required (number) legalEntityFk
// field below, matching CreateBranchRequest's shape.
//
// Business Code (branchCode) — RULE-ORG-011, RULE-ORG-012, RULE-ORG-013,
// RULE-ORG-014: system-generated via NumberingEngine, immutable after first
// save, and rejected if present in an Update payload. Nothing to encode here
// — CreateBranchRequest/UpdateBranchRequest (branchesApi.ts) already have no
// branchCode field at all, so the DTO shape itself is the enforcement
// (F3-BC-RULE-1..3: field is display-only on both forms). RULE-ORG-012's
// sequence-conflict case is a 409 raised by the server during generation —
// no client field exists to validate against it.
//
// RULE-ORG-015 — nameAr/nameEn uniqueness within parent scope is
// server-enforced (409); no client-side pre-check declared per SRS (no
// async on-blur uniqueness lookup is implemented — not specified/required).
//
// RULE-ORG-016 — audit fields (createdBy/createdAt/updatedBy/updatedAt) are
// never sent by the client; already true since CreateBranchRequest/
// UpdateBranchRequest carry no audit fields.
const nameArSchema = z.string().min(1, 'Arabic name is required.');
const nameEnSchema = z.string().min(1, 'English name is required.');
const legalEntityFkSchema = z.number();
const branchTypeIdSchema = z.string().min(1, 'Branch type is required.');
const notesSchema = z.string().optional();

export const createBranchSchema = z.object({
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  legalEntityFk: legalEntityFkSchema,
  branchTypeId: branchTypeIdSchema,
  notes: notesSchema,
}) satisfies z.ZodType<CreateBranchRequest>;
export type CreateBranchFormValues = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z.object({
  nameAr: nameArSchema.optional(),
  nameEn: nameEnSchema.optional(),
  branchTypeId: branchTypeIdSchema.optional(),
  notes: notesSchema,
}) satisfies z.ZodType<UpdateBranchRequest>;
export type UpdateBranchFormValues = z.infer<typeof updateBranchSchema>;
