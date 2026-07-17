import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BaseApiService } from '../../../base/base-api.service';
import { PagedResponse } from '../../../models/paged-response.model';
import {
  FileAccessTokenAction,
  FileAccessTokenResponse,
  FileCategoryOptionResponse,
  FileDeleteConfirmation,
  FileDocumentSummaryResponse,
  FileUploadResponse,
  FileUploadTokenRequest,
  FileUploadTokenResponse
} from '../models/file-attachment.model';

export interface FileDownloadResult {
  blob: Blob;
  fileName: string | null;
  mimeType: string | null;
}

@Injectable()  // NOT providedIn: 'root' — component-scoped, per B.2.3
export class FileAttachmentApiService extends BaseApiService {

  // upload/download/delete are permitAll'd, token-only routes with no /api prefix
  // (POLICY-CLI-06 — no JWT validation inside those 3 routes); issue-token/access-token/
  // list are authenticated and live under /api/v1/files. Two distinct base paths by design.
  private readonly rootUrl = environment.authApiUrl;
  private readonly filesUrl = `${this.rootUrl}/api/v1/files`;

  requestUploadToken(request: FileUploadTokenRequest): Observable<FileUploadTokenResponse> {
    return this.doPost<FileUploadTokenResponse>(`${this.filesUrl}/upload-token`, request);
  }

  uploadFile(encryptedToken: string, file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.doPost<FileUploadResponse>(`${this.rootUrl}/upload/${encryptedToken}`, formData);
  }

  issueAccessToken(fileDocumentPk: number, action: FileAccessTokenAction): Observable<FileAccessTokenResponse> {
    const params = new HttpParams().set('action', action);
    return this.doPost<FileAccessTokenResponse>(`${this.filesUrl}/${fileDocumentPk}/access-token?${params.toString()}`, {});
  }

  // GET /download/{token} returns a raw binary body (never an ApiResponse envelope) with the
  // filename/mime carried in headers (F2.md) — doGet<T>() can't be used, it assumes JSON + unwraps
  // `.data`. Uses the inherited `http` client directly (still BaseApiService-mediated, not a bypass).
  downloadFile(encryptedToken: string): Observable<FileDownloadResult> {
    return this.http.get(`${this.rootUrl}/download/${encryptedToken}`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(response => ({
        blob: response.body as Blob,
        fileName: this.parseFileName(response.headers.get('Content-Disposition')),
        mimeType: response.headers.get('Content-Type')
      }))
    );
  }

  deleteFile(encryptedToken: string): Observable<FileDeleteConfirmation> {
    return this.doDelete<FileDeleteConfirmation>(`${this.rootUrl}/${encryptedToken}`);
  }

  listByOwner(
    ownerId: number,
    params: { ownerType?: string; page?: number; size?: number; sortBy?: string; sortDir?: string }
  ): Observable<PagedResponse<FileDocumentSummaryResponse>> {
    let httpParams = new HttpParams();
    if (params.ownerType) httpParams = httpParams.set('ownerType', params.ownerType);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    return this.doGet<PagedResponse<FileDocumentSummaryResponse>>(`${this.filesUrl}/${ownerId}`, httpParams);
  }

  // GAP-FILE-003 (resolved) — GET /api/v1/files/categories?moduleCode={code}, backed by
  // FileCategoryOptionService.listOptionsByModule() (erp-file), verified live.
  listCategoryOptions(moduleCode: string): Observable<FileCategoryOptionResponse[]> {
    const params = new HttpParams().set('moduleCode', moduleCode);
    return this.doGet<FileCategoryOptionResponse[]>(`${this.filesUrl}/categories`, params);
  }

  private parseFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
    const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    if (utf8Match) return decodeURIComponent(utf8Match[1]);
    const quotedMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    return quotedMatch ? quotedMatch[1] : null;
  }
}
