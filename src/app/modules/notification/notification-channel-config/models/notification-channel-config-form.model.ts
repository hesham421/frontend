import { NotificationChannelConfigDto, UpdateNotificationChannelConfigRequest } from './notification-channel-config.model';

/**
 * Form model for SCR-NOTIF-003's inline toggle list (PATTERN-2, 5 fixed rows).
 * No toCreateRequest — API-NOTIF-011/012 are list/update only, there is no
 * create endpoint for this entity (channelTypeId rows are fixed, never created).
 */
export interface NotificationChannelConfigFormModel {
  isEnabledFl: boolean;
  configJson: string;
}

export const NotificationChannelConfigFormMapper = {
  createEmpty(): NotificationChannelConfigFormModel {
    return { isEnabledFl: false, configJson: '' };
  },

  fromDomain(dto: NotificationChannelConfigDto): NotificationChannelConfigFormModel {
    return {
      isEnabledFl: dto.isEnabledFl,
      configJson: dto.configJson ?? ''
    };
  },

  toUpdateRequest(model: NotificationChannelConfigFormModel): UpdateNotificationChannelConfigRequest {
    return {
      isEnabledFl: model.isEnabledFl,
      configJson: model.configJson || undefined
    };
  }
};
