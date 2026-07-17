import { PagedResponse } from 'src/app/shared/models/paged-response.model';

/**
 * NOTIF_TEMPLATE response DTO (ENTITY-NOTIF-002, API-NOTIF-006..010).
 * fileFk is deliberately NEVER modeled here — F1.md: "NEVER modeled in TypeScript
 * in Phase 1 — DEFERRED, unused" (XM-NOTIF-001, see execution-state.json deferred_xm[]).
 */
export interface NotificationTemplateDto {
  id: number;
  templateCode: string;
  templateNameAr: string;
  templateNameEn: string;
  channelTypeId: string;
  moduleCode: string;
  templateBodyAr?: string;
  templateBodyEn?: string;
  isActiveFl: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type NotificationTemplatePagedResponse = PagedResponse<NotificationTemplateDto>;

/**
 * Contract filter/sort matching backend BaseSearchContractRequest — same local
 * pattern as notification-inbox/security's ContractFilter/ContractSort (no
 * shared version exists yet in shared/models; flagged for future extraction).
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
 * Wire request for API-NOTIF-006 (POST /api/v1/notifications/templates/search).
 */
export interface NotificationTemplateSearchRequest {
  filters: ContractFilter[];
  sorts?: ContractSort[];
  page: number;
  size: number;
  templateCode?: string;
  channelTypeId?: string;
  moduleCode?: string;
  isActiveFl?: boolean;
}

/**
 * templateBodyAr/En are optional at the wire-contract level (RULE-NOTIF-006's
 * bilingual-completeness check is enforced by NotificationTemplateService.assertBilingual,
 * not DTO validation — see execution-state.json svcapi_template_bilingual_errcode note)
 * even though the SCR-NOTIF-002 form treats both as required inputs.
 */
export interface CreateNotificationTemplateRequest {
  templateCode: string;
  templateNameAr: string;
  templateNameEn: string;
  channelTypeId: string;
  moduleCode: string;
  templateBodyAr?: string;
  templateBodyEn?: string;
}

/**
 * templateCode is immutable (RULE-NOTIF-007, readonly on EDIT) — omitted here per B.1.4.
 */
export interface UpdateNotificationTemplateRequest {
  templateNameAr: string;
  templateNameEn: string;
  channelTypeId: string;
  moduleCode: string;
  templateBodyAr?: string;
  templateBodyEn?: string;
}
