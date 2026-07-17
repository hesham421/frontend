import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import {
  NotificationHistorySearchRequest,
  NotificationLogPagedResponse,
  NotificationSendConfirmation,
  NotificationUnreadSummary
} from '../models/notification-log.model';

/**
 * API service for NOTIF_LOG (API-NOTIF-003..005).
 */
@Injectable()
export class NotificationInboxApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/v1/notifications`;

  searchHistory(request: NotificationHistorySearchRequest): Observable<NotificationLogPagedResponse> {
    return this.doPost<NotificationLogPagedResponse>(`${this.baseUrl}/history/search`, request);
  }

  /**
   * API-NOTIF-004 — GOVERNANCE-NOTE-BLOCKED (DRV-NOTIF-003): backend service throws
   * NOTIF_READ_TRACKING_UNAVAILABLE (422) unconditionally. Contract shell only, not
   * called from NotificationInboxFacade — see F2.md's deferred bell/unread-count note.
   */
  getUnread(): Observable<NotificationUnreadSummary> {
    return this.doGet<NotificationUnreadSummary>(`${this.baseUrl}/unread`);
  }

  /**
   * API-NOTIF-005 — GOVERNANCE-NOTE-BLOCKED, same status as getUnread() above.
   */
  markAsRead(id: number): Observable<NotificationSendConfirmation> {
    return this.doPut<NotificationSendConfirmation>(`${this.baseUrl}/${id}/read`, {});
  }
}
