import { FileDocumentSummaryResponse, FileUploadTokenRequest } from './file-attachment.model';

// Upload-only form — this module has no update endpoint (SVCAPI exposes upload/download/
// delete/list/issue-token only; file content and category are immutable post-upload,
// RULE-FILE-001/005). FormMapper therefore omits toUpdateRequest() — there is no
// UpdateFileDocumentRequest to produce. Deviation from the canonical 4-method pattern,
// documented rather than fabricated (same practice as this module's DRV-FILE-* notes).
export interface FileUploadFormModel {
  file: File | null;
  fileCategoryFk: number | null;
}

export const FileUploadFormMapper = {

  createEmpty(): FileUploadFormModel {
    return { file: null, fileCategoryFk: null };
  },

  fromDomain(dto: FileDocumentSummaryResponse): FileUploadFormModel {
    return { file: null, fileCategoryFk: dto.fileCategoryFk };
  },

  // ownerId/ownerType/moduleCode are deliberately excluded — F1.md marks them
  // "context-supplied (hidden), not user input"; the host screen supplies them as
  // component @Inputs (F4-SCREEN), not as form state. The facade merges them in.
  // fileCategoryFk is REQUIRED (F1-SCREEN Upload Form Model) — non-null by the time
  // this runs, since ON_SUBMIT only fires after Validators.required passes.
  toCreateRequest(model: FileUploadFormModel): Pick<FileUploadTokenRequest, 'fileCategoryFk'> {
    return { fileCategoryFk: model.fileCategoryFk! };
  }
};
