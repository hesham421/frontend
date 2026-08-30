import { z } from 'zod';
import type {
  LookupDetailCreateRequest,
  LookupDetailUpdateRequest,
  MasterLookupCreateRequest,
  MasterLookupUpdateRequest,
} from '../api/masterLookupsApi';

// lookupKey is CREATE-only and immutable (matches MasterLookupUpdateRequest's
// real shape, which has no lookupKey field at all) — same convention as
// roles.schema.ts's roleCode.
const lookupKeySchema = z
  .string()
  .min(1, 'Lookup key is required.')
  .max(50, 'Lookup key must be 50 characters or fewer.')
  .regex(/^[A-Z][A-Z0-9_]*$/, 'Lookup key must start with a letter and contain only uppercase letters, numbers, and underscores.');

const lookupNameSchema = z
  .string()
  .min(1, 'Lookup name is required.')
  .max(200, 'Lookup name must be 200 characters or fewer.');
const lookupNameEnSchema = z.string().max(200, 'English lookup name must be 200 characters or fewer.').optional();
const descriptionSchema = z.string().max(500, 'Description must be 500 characters or fewer.').optional();

export const createMasterLookupSchema = z.object({
  lookupKey: lookupKeySchema,
  lookupName: lookupNameSchema,
  lookupNameEn: lookupNameEnSchema,
  description: descriptionSchema,
  isActive: z.boolean().optional(),
}) satisfies z.ZodType<MasterLookupCreateRequest>;
export type CreateMasterLookupFormValues = z.infer<typeof createMasterLookupSchema>;

export const updateMasterLookupSchema = z.object({
  lookupName: lookupNameSchema,
  lookupNameEn: lookupNameEnSchema,
  description: descriptionSchema,
}) satisfies z.ZodType<MasterLookupUpdateRequest>;
export type UpdateMasterLookupFormValues = z.infer<typeof updateMasterLookupSchema>;

// Detail code is CREATE-only and immutable, same reasoning as lookupKey. No
// case constraint is documented for it (unlike lookupKey's explicit
// "UPPERCASE"), so only length/required are enforced here.
const detailCodeSchema = z
  .string()
  .min(1, 'Code is required.')
  .max(50, 'Code must be 50 characters or fewer.');
const nameArSchema = z
  .string()
  .min(1, 'Arabic name is required.')
  .max(200, 'Arabic name must be 200 characters or fewer.');
const nameEnSchema = z.string().max(200, 'English name must be 200 characters or fewer.').optional();
const extraValueSchema = z.string().max(255, 'Extra value must be 255 characters or fewer.').optional();
const sortOrderSchema = z.number().int().optional();

export const createLookupDetailSchema = z.object({
  masterLookupId: z.number(),
  code: detailCodeSchema,
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  extraValue: extraValueSchema,
  sortOrder: sortOrderSchema,
  isActive: z.boolean().optional(),
}) satisfies z.ZodType<LookupDetailCreateRequest>;
export type CreateLookupDetailFormValues = z.infer<typeof createLookupDetailSchema>;

export const updateLookupDetailSchema = z.object({
  nameAr: nameArSchema,
  nameEn: nameEnSchema,
  extraValue: extraValueSchema,
  sortOrder: sortOrderSchema,
}) satisfies z.ZodType<LookupDetailUpdateRequest>;
export type UpdateLookupDetailFormValues = z.infer<typeof updateLookupDetailSchema>;
