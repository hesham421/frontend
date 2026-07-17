import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Mirrors FileCategory.DEFAULT_MAX_SIZE_BYTES (backend/erp-file/.../entity/FileCategory.java,
// RULE-FILE-001) — platform default, overridden per-category by maxSizeBytesOverride when set.
export const FILE_DEFAULT_MAX_SIZE_BYTES = 5_242_880;

// RULE-FILE-001 — advisory client-side pre-check (ON_CHANGE, file picker selection); server-side
// is authoritative (ERR-FILE-0001). Pass the selected FileCategory's maxSizeBytesOverride when
// set, else FILE_DEFAULT_MAX_SIZE_BYTES. Validates a control holding a browser File object.
export function fileSizeValidator(maxSizeBytes: number = FILE_DEFAULT_MAX_SIZE_BYTES): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value as File | null;
    if (!file) return null;
    return file.size > maxSizeBytes
      ? { fileSizeExceeded: { maxSizeBytes, actualSizeBytes: file.size } }
      : null;
  };
}
