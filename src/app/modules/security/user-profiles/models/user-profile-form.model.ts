import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfileDto
} from './user-profile.model';

/**
 * Shared form model for Create and Edit user profile.
 * userId is create-only (immutable once assigned — shared PK with USERS).
 */
export interface UserProfileFormModel {
  userIdFk: number | null;
  branchIdFk: number | null;
  fullNameAr: string;
  fullNameEn: string;
  preferredLang: string;
  employeeIdFk: number | null;
}

export const UserProfileFormMapper = {
  createEmpty(): UserProfileFormModel {
    return {
      userIdFk: null,
      branchIdFk: null,
      fullNameAr: '',
      fullNameEn: '',
      preferredLang: '',
      employeeIdFk: null
    };
  },

  fromDomain(dto: UserProfileDto): UserProfileFormModel {
    return {
      userIdFk: dto.userIdFk,
      branchIdFk: dto.branchIdFk,
      fullNameAr: dto.fullNameAr ?? '',
      fullNameEn: dto.fullNameEn ?? '',
      preferredLang: dto.preferredLang ?? '',
      employeeIdFk: dto.employeeIdFk ?? null
    };
  },

  toCreateRequest(model: UserProfileFormModel): CreateUserProfileRequest {
    return {
      userIdFk: model.userIdFk as number,
      branchIdFk: model.branchIdFk as number,
      fullNameAr: model.fullNameAr.trim() || undefined,
      fullNameEn: model.fullNameEn.trim() || undefined,
      preferredLang: model.preferredLang.trim() || undefined,
      employeeIdFk: model.employeeIdFk ?? undefined
    };
  },

  toUpdateRequest(model: UserProfileFormModel): UpdateUserProfileRequest {
    return {
      branchIdFk: model.branchIdFk as number,
      fullNameAr: model.fullNameAr.trim() || undefined,
      fullNameEn: model.fullNameEn.trim() || undefined,
      preferredLang: model.preferredLang.trim() || undefined,
      employeeIdFk: model.employeeIdFk ?? undefined
    };
  }
};
