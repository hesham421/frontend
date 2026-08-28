// F3 — SECURITY module ERR-SEC-{NNN} message registry, 1:1 with RULE-SEC-{NNN}
// (srs.md A4). Synthetic IDs assigned by P3.2 per the governance-gap note in
// F3-HEADER.md — SECURITY never passed through P1's normal ERR-ID assignment,
// so this is the only registry that exists for these codes. Message text is
// copied verbatim from srs.md, never invented (HR-1).
//
// Multi-message rules (049/045/048) get one entry per distinct message,
// suffixed to stay addressable — the rule statement covers two rejection
// cases with two different texts.
export const SEC_ERRORS = {
  'ERR-SEC-030': {
    ar: 'حسابك قيد التفعيل — يرجى تأكيد بريدك الإلكتروني أولاً',
    en: 'Your account is pending activation — please confirm your email first',
  },
  'ERR-SEC-032': {
    ar: 'الرمز غير صالح أو منتهي الصلاحية',
    en: 'Token is invalid or has expired',
  },
  'ERR-SEC-033': {
    ar: 'هذا الرمز مُستخدَم مسبقاً',
    en: 'This token has already been used',
  },
  'ERR-SEC-034': {
    ar: 'الفرع المحدَّد غير موجود أو غير نشط',
    en: 'Selected branch does not exist or is not active',
  },
  'ERR-SEC-035': {
    ar: 'مستوى الوصول للبيانات إلزامي ويجب أن يكون قيمة معتمَدة',
    en: 'Data access level is required and must be a valid, active value',
  },
  'ERR-SEC-036': {
    ar: 'هذا الفرع مُسنَد بالفعل لهذا الدور',
    en: 'This branch is already assigned to this role',
  },
  'ERR-SEC-038': {
    ar: 'إذا كان بريدك مسجَّلاً لدينا، ستصلك رسالة استعادة كلمة المرور',
    en: 'If your email is registered, you will receive a password reset message',
  },
  'ERR-SEC-040': {
    ar: 'اسم المستخدم مستخدَم بالفعل',
    en: 'Username already exists',
  },
  'ERR-SEC-041': {
    ar: 'البريد الإلكتروني مستخدَم بالفعل',
    en: 'Email already exists',
  },
  'ERR-SEC-042': {
    ar: 'صلاحية العرض تُضاف تلقائياً ولا يمكن إزالتها بمفردها',
    en: 'VIEW permission is added automatically and cannot be removed independently',
  },
  'ERR-SEC-043': {
    ar: 'نوع الصلاحية غير صالح',
    en: 'Invalid permission type',
  },
  'ERR-SEC-045-EMPTY': {
    ar: 'لا توجد صلاحيات لنسخها من هذا الدور',
    en: 'No permissions to copy from this role',
  },
  'ERR-SEC-045-SELF': {
    ar: 'لا يمكن النسخ من نفس الدور',
    en: 'Cannot copy from the same role',
  },
  'ERR-SEC-046': {
    ar: 'رمز أو مسار الشاشة غير صالح، أو مستخدَم بالفعل، أو الشاشة الأب غير صحيحة',
    en: 'Invalid or duplicate page code/route, or invalid parent page',
  },
  'ERR-SEC-048-DUPLICATE': {
    ar: 'رمز أو اسم الدور مستخدَم بالفعل',
    en: 'Role code or name already exists',
  },
  'ERR-SEC-048-DELETE': {
    ar: 'لا يمكن حذف دور له مستخدمون مُسنَدون',
    en: 'Cannot delete a role with assigned users',
  },
  'ERR-SEC-049-USERNAME': {
    ar: 'اسم المستخدم مستخدَم بالفعل',
    en: 'Username already exists',
  },
  'ERR-SEC-049-DELETE': {
    ar: 'لا يمكن حذف مستخدم لديه جلسات نشطة',
    en: 'Cannot delete a user with active sessions',
  },
  'ERR-SEC-050': {
    ar: 'تجاوزت الحد المسموح من المحاولات — حاول لاحقاً',
    en: 'Too many attempts — please try again later',
  },
} as const;

export type SecErrorId = keyof typeof SEC_ERRORS;

export function secErrorMessage(id: SecErrorId, lang: 'ar' | 'en'): string {
  return SEC_ERRORS[id][lang];
}
