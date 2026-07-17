// Field shapes mirror backend Response DTOs exactly (api-docs/endpoints/file-service/*.md).
// FileDocument's full entity (ownerId, ownerType, moduleCode, mimeType, updatedBy, updatedAt)
// is never returned to the frontend by any endpoint — only the subsets below exist on the wire.

export interface FileDocumentSummaryResponse {
  fileDocumentPk: number;
  fileNameOriginal: string;
  fileCategoryFk: number;
  fileCategoryNameAr: string;
  fileCategoryNameEn: string;
  fileTypeId: string;
  fileSizeBytes: number;
  fileStatusId: string;
  createdAt: string;
}

export interface FileUploadResponse {
  fileDocumentPk: number;
  fileNameOriginal: string;
  fileTypeId: string;
  fileSizeBytes: number;
  fileStatusId: string;
}

export interface FileUploadTokenRequest {
  ownerId: number;
  ownerType: string;
  moduleCode: string;
  fileCategoryFk: number;
}

export interface FileUploadTokenResponse {
  encryptedToken: string;
  expiresAt: string;
}

export type FileAccessTokenAction = 'DOWNLOAD' | 'DELETE';

export interface FileAccessTokenResponse {
  encryptedToken: string;
  expiresAt: string;
}

export interface FileDeleteConfirmation {
  fileDocumentPk: number;
  fileStatusId: string;
}

// GAP-FILE-003 (resolved) — backed by GET /api/v1/files/categories?moduleCode={code}
// (FileCategoryOptionService, erp-file), verified live against the real endpoint.
export interface FileCategoryOptionResponse {
  fileCategoryPk: number;
  categoryCode: string;
  nameAr: string;
  nameEn: string;
  moduleCode: string;
}
