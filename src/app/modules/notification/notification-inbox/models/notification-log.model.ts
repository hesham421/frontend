import { PagedResponse } from 'src/app/shared/models/paged-response.model';

/**
 * NOTIF_LOG response DTO (ENTITY-NOTIF-001, API-NOTIF-003/004).
 * Field names match NotificationLogResponse exactly (api-docs searchHistory.md/unread.md) —
 * backend uses `id`, not `notificationLogPk` as F1.md's plan prose implies.
 */
export interface NotificationLogDto {
  id: number;
  recipientId: number;
  notificationTypeId: string;
  templateCode: string;
  subject?: string;
  bodyPreview?: string;
  notificationStatusId: string;
  retryCount: number;
  sentAt?: string;
  moduleCode: string;
  referenceId?: number;
  referenceType?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type NotificationLogPagedResponse = PagedResponse<NotificationLogDto>;

/**
 * Contract filter/sort matching backend BaseSearchContractRequest — same local
 * pattern as security/user-profiles' ContractFilter/ContractSort (no shared
 * version exists yet in shared/models; flagged for future extraction).
 */
export interface ContractFilter {
  field: string;
  operator: string;
  value?: string | number | boolean | Array<string | number>;
}

export interface ContractSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

/**
 * Wire request for API-NOTIF-003 (POST /api/v1/notifications/history/search).
 */
export interface NotificationHistorySearchRequest {
  filters: ContractFilter[];
  sorts?: ContractSort[];
  page: number;
  size: number;
  recipientId?: number;
  notificationTypeId?: string;
  notificationStatusId?: string;
}

/**
 * UI-facing filter panel model for SCR-NOTIF-001 (F1-SCREEN spec), mapped to
 * NotificationHistorySearchRequest by the facade (F2). recipientId is deliberately
 * excluded — stays system-resolved per ENTITY-NOTIF-001's field note, not a UI filter.
 */
export interface NotificationHistoryFilter {
  notificationTypeId?: string;
  notificationStatusId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * API-NOTIF-004 response (GET /api/v1/notifications/unread) — GOVERNANCE-NOTE-BLOCKED
 * per DRV-NOTIF-003 (no read/unread column on NOTIF_LOG). Contract shell only; not
 * wired into SCR-NOTIF-001's UI (bell/unread-count init step is deferred per F2.md).
 */
export interface NotificationUnreadSummary {
  count: number;
  items: NotificationLogDto[];
}

/**
 * API-NOTIF-005 response (PUT /api/v1/notifications/{id}/read) — GOVERNANCE-NOTE-BLOCKED,
 * same status as NotificationUnreadSummary above.
 */
export interface NotificationSendConfirmation {
  logEntryIds: number[];
}
