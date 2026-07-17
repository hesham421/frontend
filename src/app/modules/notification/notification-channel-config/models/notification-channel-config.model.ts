/**
 * NOTIF_CHANNEL_CONFIG response DTO (ENTITY-NOTIF-003, API-NOTIF-011/012).
 * No search/pagination — API-NOTIF-011 returns a plain array (5 fixed rows,
 * no create/delete), so no ContractFilter/Sort/PagedResponse applies here.
 */
export interface NotificationChannelConfigDto {
  id: number;
  channelTypeId: string;
  isEnabledFl: boolean;
  configJson?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * channelTypeId is immutable (read-only, fixed 5 rows) — omitted per B.1.4.
 */
export interface UpdateNotificationChannelConfigRequest {
  isEnabledFl: boolean;
  configJson?: string;
}
