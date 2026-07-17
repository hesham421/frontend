import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { BaseApiService } from 'src/app/shared/base/base-api.service';
import { NotificationChannelConfigDto, UpdateNotificationChannelConfigRequest } from '../models/notification-channel-config.model';

/**
 * API service for NOTIF_CHANNEL_CONFIG (API-NOTIF-011/012). No search() — API-NOTIF-011
 * returns a plain array (5 fixed rows, no pagination/filtering).
 */
@Injectable()
export class NotificationChannelConfigApiService extends BaseApiService {
  private readonly baseUrl = `${environment.authApiUrl}/api/v1/notifications/channel-configs`;

  listAll(): Observable<NotificationChannelConfigDto[]> {
    return this.doGet<NotificationChannelConfigDto[]>(this.baseUrl);
  }

  update(id: number, request: UpdateNotificationChannelConfigRequest): Observable<NotificationChannelConfigDto> {
    return this.doPut<NotificationChannelConfigDto>(`${this.baseUrl}/${id}`, request);
  }
}
