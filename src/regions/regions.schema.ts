import { z } from 'zod';
import type { CreateRegionRequest, UpdateRegionRequest } from './regionsApi';

// F3/SCR-ORG-003 — Regions validation rules.
//
// RULE-ORG-006 — deactivation guard: active Branches referencing this Region
// block deactivation. Server-enforced 409 surfaced via the deactivate
// action; there is no client-checkable field — isActive itself isn't part
// of this create/update form, so nothing is modeled here.
//
// RULE-ORG-017 — deactivation SOFT-READ consumer-check warning: server
// checks for other modules referencing an active Region before deactivation
// and surfaces an informational warning banner (OQ-001 still DEFERRED at
// consumer-module level — banner must never claim full safety). This is a
// UI-banner concern on the deactivate action, not a form field — out of
// scope for this schema file; documented here only.
//
// Business Code (regionCode) — RULE-ORG-011, RULE-ORG-012, RULE-ORG-013,
// RULE-ORG-014: system-generated via NumberingEngine, immutable after first
// save, and rejected if present in an Update payload. Nothing to encode here
// — CreateRegionRequest/UpdateRegionRequest (regionsApi.ts) already have no
// regionCode field at all, so the DTO shape itself is the enforcement
// (F3-BC-RULE-1..3: field is display-only on both forms). RULE-ORG-012's
// sequence-conflict case is a 409 raised by the server during generation —
// no client field exists to validate against it.
//
// RULE-ORG-015 — nameAr/nameEn uniqueness within parent scope is
// server-enforced (409); no client-side pre-check declared per SRS (no
// async on-blur uniqueness lookup is implemented — not specified/required).
//
// RULE-ORG-016 — audit fields (createdBy/createdAt/updatedBy/updatedAt) are
// never sent by the client; already true since CreateRegionRequest/
// UpdateRegionRequest carry no audit fields.
//
// legalEntityFk / regionTypeIdFk — both required (number) FKs on Create,
// both correctly absent from Update per region-management.md (immutable
// after creation). regionTypeIdFk is a DEFERRED FK (FINDING-2/OQ-ORG-002 —
// no listing endpoint exists for it yet, already documented in
// regionsApi.ts); modeled here purely as a required z.number() on Create
// like any other required FK field, with no picker/resolution attempted.
const nameArSchema = z.string().min(1, 'Arabic name is required.');
const nameEnSchema = z.string().min(1, 'English name is required.');
const legalEntityFkSchema = z.number();
const regionTypeIdFkSchema = z.number();
const notesSchema = z.string().optional();

export const createRegionSchema = z.object({
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  legalEntityFk: legalEntityFkSchema,
  regionTypeIdFk: regionTypeIdFkSchema,
  notes: notesSchema,
}) satisfies z.ZodType<CreateRegionRequest>;
export type CreateRegionFormValues = z.infer<typeof createRegionSchema>;

export const updateRegionSchema = z.object({
  nameAr: nameArSchema.optional(),
  nameEn: nameEnSchema.optional(),
  notes: notesSchema,
}) satisfies z.ZodType<UpdateRegionRequest>;
export type UpdateRegionFormValues = z.infer<typeof updateRegionSchema>;
