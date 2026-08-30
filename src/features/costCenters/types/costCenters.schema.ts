import { z } from 'zod';
import type { CreateCostCenterRequest, UpdateCostCenterRequest } from '../api/costCentersApi';

// F3/SCR-ORG-005 — Cost Centers validation rules.
//
// RULE-ORG-004 — Branch deactivation guard: the system MUST prevent
// deactivation of a Branch when active CostCenters reference it. This is a
// Branch-entity concern (server-enforced 409 on the Branch's own deactivate
// action, see branches.schema.ts) — not this entity's own field, and there
// is no client-checkable field on the CostCenter create/update form for it.
// Cross-referenced here only.
//
// RULE-ORG-008 — circular reference prevention in the CostCenter tree
// (parentCostCenterFk must never resolve to the record's own subtree).
// Client-side prevention at selection time per ui-ux-spec: implemented as
// excludeSelfAndDescendantsFromParentOptions in hooks.ts (applied to
// parentCostCenterFkOptions), not in this schema file — cross-referenced
// here, not duplicated. Server-enforced as defense-in-depth on both
// CREATE and UPDATE (UpdateCostCenterRequest allows re-parenting via
// parentCostCenterFk, which is exactly why the guard applies on both).
//
// RULE-ORG-010 — SUMMARY-type CostCenter restriction on transactional
// records: explicitly N/A to ORG's own screens per spec (SRS Test-Hint) —
// enforced in consumer modules' UIs, not here. nodeTypeId is otherwise a
// plain required LOV field on this form; no SUMMARY-specific client check
// is added. Document only.
//
// RULE-ORG-019 — CostCenter must belong to an active Branch. The branchFk
// picker is already restricted to isActive=true records by
// useBranchesOptions (src/branches/hooks.ts), established in F2. This rule
// is satisfied structurally by that existing query filter — no new
// filtering logic is added here, only the required (number) branchFk field
// below, matching CreateCostCenterRequest's shape.
//
// RULE-ORG-020 — nodeTypeId (SUMMARY/DETAIL) immutable after save. Enforced
// structurally: UpdateCostCenterRequest (costCentersApi.ts) has no
// nodeTypeId field at all, so it is absent from updateCostCenterSchema
// below — the DTO shape itself is the enforcement (same muted read-only
// convention as Business Code in EDIT mode). Note costCenterTypeId is a
// DIFFERENT field and IS present/editable on Update (re-parenting/
// reclassification allowed) — do not conflate the two; only nodeTypeId is
// immutable per this rule.
//
// Business Code (costCenterCode) — RULE-ORG-011, RULE-ORG-012,
// RULE-ORG-013, RULE-ORG-014: system-generated via NumberingEngine,
// immutable after first save, and rejected if present in an Update
// payload. Nothing to encode here — CreateCostCenterRequest/
// UpdateCostCenterRequest (costCentersApi.ts) already have no
// costCenterCode field at all, so the DTO shape itself is the enforcement
// (F3-BC-RULE-1..3: field is display-only on both forms). RULE-ORG-012's
// sequence-conflict case is a 409 raised by the server during generation —
// no client field exists to validate against it.
//
// RULE-ORG-015 — nameAr/nameEn uniqueness within parent scope is
// server-enforced (409); no client-side pre-check declared per SRS (no
// async on-blur uniqueness lookup is implemented — not specified/required).
//
// RULE-ORG-016 — audit fields (createdBy/createdAt/updatedBy/updatedAt) are
// never sent by the client; already true since CreateCostCenterRequest/
// UpdateCostCenterRequest carry no audit fields.
const nameArSchema = z.string().min(1, 'Arabic name is required.');
const nameEnSchema = z.string().min(1, 'English name is required.');
const branchFkSchema = z.number();
const parentCostCenterFkSchema = z.number().optional();
const nodeTypeIdSchema = z.string().min(1, 'Node type is required.');
const costCenterTypeIdSchema = z.string().min(1, 'Cost center type is required.');
const notesSchema = z.string().optional();

export const createCostCenterSchema = z.object({
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  branchFk: branchFkSchema,
  parentCostCenterFk: parentCostCenterFkSchema,
  nodeTypeId: nodeTypeIdSchema,
  costCenterTypeId: costCenterTypeIdSchema,
  notes: notesSchema,
}) satisfies z.ZodType<CreateCostCenterRequest>;
export type CreateCostCenterFormValues = z.infer<typeof createCostCenterSchema>;

export const updateCostCenterSchema = z.object({
  nameAr: nameArSchema.optional(),
  nameEn: nameEnSchema.optional(),
  parentCostCenterFk: parentCostCenterFkSchema,
  costCenterTypeId: costCenterTypeIdSchema.optional(),
  notes: notesSchema,
}) satisfies z.ZodType<UpdateCostCenterRequest>;
export type UpdateCostCenterFormValues = z.infer<typeof updateCostCenterSchema>;
