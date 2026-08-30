import { z } from 'zod';

// F3/SCR-SEC-001 — Zod primitives for the 4 auth sub-forms sharing Login.tsx's
// `activeTab` (Signup/Activate/Forgot/Reset). RULE-SEC-030/032/033/038/050 are
// not field-level rules (post-submit display or server round-trip only, no
// client-side pre-check exists) — they are documented, not encoded, below;
// consumers wire them via `secErrorMessage` from `lib/errors/secErrors.ts`
// against the mutation's ApiError once the real facade is attached (F4).

// RULE-SEC-040/041 — uniqueness is ON_SUBMIT/server-only; only format+length
// are client-checkable (ON_BLUR).
export const signupSchema = z.object({
  username: z.string().min(3).max(80),
  email: z.string().email().max(150),
  password: z.string().min(1),
});
export type SignupFormValues = z.infer<typeof signupSchema>;

// token is opaque by design (RULE-SEC-032/033) — required, no client format check.
export const activateSchema = z.object({
  token: z.string().min(1),
});
export type ActivateFormValues = z.infer<typeof activateSchema>;

// RULE-SEC-038 — existence is never revealed; only format is checked client-side.
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(1),
});
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginFormValues = z.infer<typeof loginSchema>;
