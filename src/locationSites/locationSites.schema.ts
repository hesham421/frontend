import { z } from 'zod';
import type { CreateLocationSiteRequest, UpdateLocationSiteRequest } from './locationSitesApi';

// F3/SCR-ORG-007 — Location Sites validation rules.
//
// RULE-ORG-005 — Branch deactivation guard: the system MUST prevent
// deactivation of a Branch when active LocationSites reference it. This is
// a Branch-entity concern (server-enforced 409 on the Branch's own
// deactivate action, see branches.schema.ts) — not this entity's own field,
// and there is no client-checkable field on the LocationSite create/update
// form for it. Cross-referenced here only.
//
// RULE-ORG-019 — LocationSite must belong to an active Branch. The
// branchFk picker is already restricted to isActive=true records by
// useBranchesOptions (src/branches/hooks.ts), established in F2. This rule
// is satisfied structurally by that existing query filter — no new
// filtering logic is added here, only the required (number) branchFk field
// below, matching CreateLocationSiteRequest's shape.
//
// Business Code (locationSiteCode) — RULE-ORG-011, RULE-ORG-012,
// RULE-ORG-013, RULE-ORG-014: system-generated via NumberingEngine,
// immutable after first save, and rejected if present in an Update
// payload. Nothing to encode here — CreateLocationSiteRequest/
// UpdateLocationSiteRequest (locationSitesApi.ts) already have no
// locationSiteCode field at all, so the DTO shape itself is the enforcement
// (F3-BC-RULE-1..3: field is display-only on both forms). RULE-ORG-012's
// sequence-conflict case is a 409 raised by the server during generation —
// no client field exists to validate against it.
//
// RULE-ORG-015 — nameAr/nameEn uniqueness within parent scope is
// server-enforced (409); no client-side pre-check declared per SRS (no
// async on-blur uniqueness lookup is implemented — not specified/required).
//
// RULE-ORG-016 — audit fields (createdBy/createdAt/updatedBy/updatedAt) are
// never sent by the client; already true since CreateLocationSiteRequest/
// UpdateLocationSiteRequest carry no audit fields.
//
// Note: unlike branchFk (immutable parent FK, correctly absent from
// UpdateLocationSiteRequest), siteTypeId is NOT immutable — it IS
// present/editable on Update per the real DTO shape (same pattern as
// costCenterTypeId in costCenters.schema.ts). Do not conflate the two.
const nameArSchema = z.string().min(1, 'Arabic name is required.');
const nameEnSchema = z.string().min(1, 'English name is required.');
const branchFkSchema = z.number();
const siteTypeIdSchema = z.string().min(1, 'Site type is required.');
const notesSchema = z.string().optional();

export const createLocationSiteSchema = z.object({
  branchFk: branchFkSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  siteTypeId: siteTypeIdSchema,
  notes: notesSchema,
}) satisfies z.ZodType<CreateLocationSiteRequest>;
export type CreateLocationSiteFormValues = z.infer<typeof createLocationSiteSchema>;

export const updateLocationSiteSchema = z.object({
  nameAr: nameArSchema.optional(),
  nameEn: nameEnSchema.optional(),
  siteTypeId: siteTypeIdSchema.optional(),
  notes: notesSchema,
}) satisfies z.ZodType<UpdateLocationSiteRequest>;
export type UpdateLocationSiteFormValues = z.infer<typeof updateLocationSiteSchema>;
