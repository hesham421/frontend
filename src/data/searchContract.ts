// Shared shape for every `POST /<resource>/search` endpoint (backend:
// com.erp.common.dto.BaseSearchContractRequest) — one contract for the whole
// app, real field names (filters[].field/operator/value), not a generic
// placeholder.
export type SearchOperator =
  | 'EQ' | 'NE' | 'GT' | 'GE' | 'LT' | 'LE' | 'LIKE' | 'IN' | 'IS_NULL' | 'IS_NOT_NULL' | 'BETWEEN';

export interface ContractFilter {
  field: string;
  operator: SearchOperator;
  value?: unknown;
}

export interface ContractSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface SearchContractRequest {
  filters?: ContractFilter[];
  sorts?: ContractSort[];
  page?: number;
  size?: number;
}

// Matches Spring Data's Page<T> (see "Pagination Envelope" in api-docs/index.md).
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
