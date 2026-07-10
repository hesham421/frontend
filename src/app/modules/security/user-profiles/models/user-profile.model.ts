import { PagedResponse } from 'src/app/shared/models/paged-response.model';

/**
 * SEC_USER_PROFILE response DTO (ENTITY-SEC-009, API-SEC-032..035).
 */
export interface UserProfileDto {
  userIdFk: number;
  branchIdFk: number;
  fullNameAr?: string;
  fullNameEn?: string;
  preferredLang?: string;
  employeeIdFk?: number;
  isActiveFl: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type UserProfilePagedResponse = PagedResponse<UserProfileDto>;

/**
 * Contract filter/sort matching backend BaseSearchContractRequest.
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
 * Allowed filter/sort fields per execution-plan-SEC-gaps.md Section 2: userIdFk, branchIdFk, isActiveFl.
 */
export interface UserProfileSearchRequest {
  filters: ContractFilter[];
  sorts?: ContractSort[];
  page: number;
  size: number;
}

export interface CreateUserProfileRequest {
  userIdFk: number;
  branchIdFk: number;
  fullNameAr?: string;
  fullNameEn?: string;
  preferredLang?: string;
  employeeIdFk?: number;
}

/**
 * userIdFk is immutable (path variable, shared PK with USERS) — not included (API-SEC-034).
 */
export interface UpdateUserProfileRequest {
  branchIdFk: number;
  fullNameAr?: string;
  fullNameEn?: string;
  preferredLang?: string;
  employeeIdFk?: number;
}

/**
 * Branch option for the DataScope branch dropdown (XM-SEC-001/002, sourced via API-ORG-008).
 * Deliberately local/minimal — no shared ORG-module frontend model exists yet.
 */
export interface BranchOptionDto {
  id: number;
  branchCode: string;
  nameAr?: string;
  nameEn?: string;
  isActive: boolean;
}
