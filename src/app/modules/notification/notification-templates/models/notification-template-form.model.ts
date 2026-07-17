import {
  CreateNotificationTemplateRequest,
  NotificationTemplateDto,
  UpdateNotificationTemplateRequest
} from './notification-template.model';

/**
 * Shared form model for Create and Edit (SCR-NOTIF-002, PATTERN-1).
 * templateCode is REQUIRED but readonly-after-create (RULE-NOTIF-007) — the
 * component disables its control on EDIT, the field itself stays in the model.
 * isActiveFl is REQUIRED per F1.md's Form Model but is display-only here: neither
 * Create nor Update accepts it on the wire (API-NOTIF-007/008) — status changes
 * go through the separate deactivate() action (API-NOTIF-009), not this form.
 */
export interface NotificationTemplateFormModel {
  templateCode: string;
  templateNameAr: string;
  templateNameEn: string;
  channelTypeId: string;
  moduleCode: string;
  templateBodyAr: string;
  templateBodyEn: string;
  isActiveFl: boolean;
}

export const NotificationTemplateFormMapper = {
  createEmpty(): NotificationTemplateFormModel {
    return {
      templateCode: '',
      templateNameAr: '',
      templateNameEn: '',
      channelTypeId: '',
      moduleCode: '',
      templateBodyAr: '',
      templateBodyEn: '',
      isActiveFl: true
    };
  },

  fromDomain(dto: NotificationTemplateDto): NotificationTemplateFormModel {
    return {
      templateCode: dto.templateCode,
      templateNameAr: dto.templateNameAr,
      templateNameEn: dto.templateNameEn,
      channelTypeId: dto.channelTypeId,
      moduleCode: dto.moduleCode,
      templateBodyAr: dto.templateBodyAr ?? '',
      templateBodyEn: dto.templateBodyEn ?? '',
      isActiveFl: dto.isActiveFl
    };
  },

  toCreateRequest(model: NotificationTemplateFormModel): CreateNotificationTemplateRequest {
    return {
      templateCode: model.templateCode,
      templateNameAr: model.templateNameAr,
      templateNameEn: model.templateNameEn,
      channelTypeId: model.channelTypeId,
      moduleCode: model.moduleCode,
      templateBodyAr: model.templateBodyAr || undefined,
      templateBodyEn: model.templateBodyEn || undefined
    };
  },

  toUpdateRequest(model: NotificationTemplateFormModel): UpdateNotificationTemplateRequest {
    return {
      templateNameAr: model.templateNameAr,
      templateNameEn: model.templateNameEn,
      channelTypeId: model.channelTypeId,
      moduleCode: model.moduleCode,
      templateBodyAr: model.templateBodyAr || undefined,
      templateBodyEn: model.templateBodyEn || undefined
    };
  }
};
