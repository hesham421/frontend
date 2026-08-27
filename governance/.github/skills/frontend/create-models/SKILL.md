---
name: create-models
description: "Generates a feature's TypeScript DTO types and its Zod form schema plus FormMapper. Step 2.1 — run BEFORE the api module, hooks, or components. Use whenever starting a new entity, adding an entry form, or realigning types with a backend response contract."
---

# Skill: create-models

## Description
Generates the two model files for a feature. **Step 2.1.**
Rules: `references/contract-rules.md` §R.1, §TS.

## When to Use
- Starting a new feature
- Adding or changing an entry form's shape
- A backend response contract changed

## When NOT to Use
- Before the backend contract exists — the frontend mirrors it, never invents it
- Adding one field to an existing model (edit directly)
- Cross-feature types — those live in `data/types.ts`

## Variables

| Variable | Example |
|---|---|
| `DOMAIN_DIR` | `organization` |
| `FEATURE_DIR` | `branches` |
| `ENTITY_NAME` | `Branch` |
| `ENTITY_CAMEL` | `branch` |
| `PAGE_CODE` | `BRANCH` |
| `HAS_CHILD` | `true` / `false` |

## Output

- `src/features/<FEATURE>/model/<ENTITY_CAMEL>.types.ts`
- `src/features/<FEATURE>/model/<ENTITY_CAMEL>.schema.ts`

## Constraints

- MUST NOT generate api, hook, or component code
- MUST NOT invent field names (R.1.7)
- MUST NOT redefine shared list types (R.1.6)
- MUST NOT use `any` (TS.2)
- MUST NOT introduce a separate domain type without a real transformation (R.1.10)

---

## Step 1 — DTO types

```ts
import type { PagedResponse } from '@/lib/types';

/** Mirrors the backend Branch response exactly. */
export interface BranchDto {
  id: number;
  code: string;              // natural key — immutable
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  childCount?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Gates destructive actions. Field names match the backend usage response. */
export interface BranchUsageDto {
  entityId: number;
  childCount: number;
  canDelete: boolean;
  canDeactivate: boolean;
  deleteBlockedReason?: string;
  deactivateBlockedReason?: string;
}

export interface CreateBranchRequest {
  code: string;
  nameEn: string;
  nameAr: string;
  isActive?: boolean;
}

/** Immutable fields — natural key, parent FK — are absent by contract (R.1.5). */
export interface UpdateBranchRequest {
  nameEn: string;
  nameAr: string;
}

export type BranchPage = PagedResponse<BranchDto>;
```

If `HAS_CHILD`, child DTOs go in the **same** file (R.1.1). A child's update request omits
both its own natural key and the parent FK.

### DTO vs domain type (R.1.10)

Default: the DTO *is* the domain type. Introduce a separate domain type only when a real
transformation exists — a string date becoming a `Date`, two fields collapsing into one,
a union being discriminated. Then the mapping lives in `model/` beside the types. A domain
layer that copies fields one-to-one adds a maintenance surface and no information.

## Step 2 — Zod schema and mapper

```ts
import { z } from 'zod';
import type { BranchDto, CreateBranchRequest, UpdateBranchRequest } from './branch.types';

/** Messages are translation keys, resolved at render (R.8.12, DS.5). */
export const branchFormSchema = z.object({
  code: z.string().min(1, 'validation.required').max(20, 'validation.maxLength')
         .regex(/^[A-Z0-9_]+$/, 'validation.upperSnakeOnly'),
  nameEn: z.string().min(1, 'validation.required').max(120, 'validation.maxLength'),
  nameAr: z.string().min(1, 'validation.required').max(120, 'validation.maxLength'),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).optional(),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;   // R.1.3

export const BranchFormMapper = {
  createEmpty(): BranchFormValues {
    return { code: '', nameEn: '', nameAr: '', isActive: true, sortOrder: 0 };
  },

  fromDto(dto: BranchDto): BranchFormValues {
    return {
      code: dto.code,
      nameEn: dto.nameEn,
      nameAr: dto.nameAr,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder ?? 0,      // ?? not || — R.1.8
    };
  },

  toCreateRequest(v: BranchFormValues): CreateBranchRequest {
    return { code: v.code.trim(), nameEn: v.nameEn.trim(), nameAr: v.nameAr.trim(), isActive: v.isActive };
  },

  toUpdateRequest(v: BranchFormValues): UpdateBranchRequest {
    // code omitted deliberately — immutable (R.1.5)
    return { nameEn: v.nameEn.trim(), nameAr: v.nameAr.trim() };
  },
};
```

`||` on a numeric field turns a legitimate `0` into `undefined`, which the backend then
treats as "unset" and defaults. It is the highest-frequency silent data bug in this
codebase's shape of work, which is why R.1.8 is a rejection trigger rather than a
preference.

## Step 3 — Runtime validation boundaries (TS.10)

Zod parses the **form** on submit, and parses **trust-boundary payloads** — the session
and any response containing a discriminated union.
Ordinary CRUD responses are not parsed: the type already states the contract, and parsing
every DTO doubles the maintenance without catching anything the contract tests do not.

## Verify before finishing

- [ ] Field names match the backend contract exactly
- [ ] Update requests contain no natural key and no parent FK
- [ ] Every numeric mapping uses `??`
- [ ] Shared list types imported from `data/types.ts`
- [ ] `FormValues` is `z.infer<…>`, with no parallel interface
- [ ] All four mapper methods present
- [ ] Validation messages are translation keys
- [ ] No `any`, no unsafe cast

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| DTOs split across files | R.1.1 |
| Schema declared inside a component | R.1.2 |
| Hand-written type beside the schema | R.1.3 |
| Mapper missing a method | R.1.4 |
| `code` or `parentId` in an update request | R.1.5 |
| Feature-local `PagedResponse` or `SearchRequest` | R.1.6 |
| Renamed backend field | R.1.7 |
| `\|\|` on a numeric mapping | R.1.8 |
| Domain type that only copies fields | R.1.10 |
| `any`, `as unknown as`, or `@ts-ignore` | TS.2, TS.8, TS.4 |
| English validation message in the schema | R.8.12 |

## Alignment with general React guidance

**Consistent with:** Zod's inferred-type pattern, `satisfies` for literal checking,
type-only imports.

**Deliberately different:** "derive your API types from Zod schemas" is rejected here. The
DTO mirrors a backend contract the frontend does not own; the schema describes a form the
frontend does own. Collapsing them makes a form change look like a contract change.
