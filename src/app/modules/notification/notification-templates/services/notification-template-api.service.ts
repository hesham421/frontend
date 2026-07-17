import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import {
  CreateNotificationTemplateRequest,
  NotificationTemplateDto,
  NotificationTemplatePagedResponse,
  NotificationTemplateSearchRequest,
  UpdateNotificationTemplateRequest
} from '../models/notification-template.model';

/**
 * API service for NOTIF_TEMPLATE (API-NOTIF-006..010).
 */
@Injectable()
export class NotificationTemplateApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/v1/notifications/templates`;

  search(request: NotificationTemplateSearchRequest): Observable<NotificationTemplatePagedResponse> {
    return this.doPost<NotificationTemplatePagedResponse>(`${this.baseUrl}/search`, request);
  }

  getById(id: number): Observable<NotificationTemplateDto> {
    return this.doGet<NotificationTemplateDto>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateNotificationTemplateRequest): Observable<NotificationTemplateDto> {
    return this.doPost<NotificationTemplateDto>(this.baseUrl, request);
  }

  update(id: number, request: UpdateNotificationTemplateRequest): Observable<NotificationTemplateDto> {
    return this.doPut<NotificationTemplateDto>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: number): Observable<NotificationTemplateDto> {
    return this.doPut<NotificationTemplateDto>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
