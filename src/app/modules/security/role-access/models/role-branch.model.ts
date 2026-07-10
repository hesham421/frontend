/**
 * SEC_ROLE_BRANCH response DTO (ENTITY-SEC-010, DataScope, API-SEC-036..039).
 * Composite PK (roleIdFk, branchIdFk) — no surrogate id column.
 */
export interface RoleBranchDto {
  roleIdFk: number;
  branchIdFk: number;
  /** LOV-SEC-002: BRANCH_ONLY | BRANCH_AND_CHILDREN | ALL */
  dataAccessLevel: string;
  isActiveFl: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DATA_ACCESS_LEVELS = ['BRANCH_ONLY', 'BRANCH_AND_CHILDREN', 'ALL'] as const;
export type DataAccessLevel = (typeof DATA_ACCESS_LEVELS)[number];

export interface CreateRoleBranchRequest {
  roleIdFk: number;
  branchIdFk: number;
  dataAccessLevel: string;
}

/** roleIdFk/branchIdFk are immutable (composite PK, path variables) — not included (API-SEC-038). */
export interface UpdateRoleBranchRequest {
  dataAccessLevel: string;
}

export interface ContractFilter {
  field: string;
  operator: string;
  value?: string | number | boolean | Array<string | number>;
}

export interface ContractSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface RoleBranchSearchRequest {
  filters: ContractFilter[];
  sorts?: ContractSort[];
  page: number;
  size: number;
}

/**
 * Branch option for the DataScope branch dropdown (XM-SEC-002, sourced via API-ORG-008).
 * Deliberately local/minimal — no shared ORG-module frontend model exists yet
 * (duplicated from user-profiles/models/user-profile.model.ts's BranchOptionDto by design:
 * facades are component-scoped, no cross-feature shared cache per D.5.3).
 */
export interface BranchOptionDto {
  id: number;
  branchCode: string;
  nameAr?: string;
  nameEn?: string;
  isActive: boolean;
}
