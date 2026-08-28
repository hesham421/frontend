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

// ERP-wide list-density convention (skills/ui-ux/SKILL.md): 7 rows per page by
// default across every search-backed list screen, paged via Pagination
// (components/ui/Pagination.tsx) rather than a longer single scroll.
export const DEFAULT_PAGE_SIZE = 7;

// Hard backend limit on every `POST /<resource>/search` — confirmed via a live
// SEARCH_ERROR response ("Page size must not exceed 100") when a cross-screen
// "give me every X for a picker" query asked for more. Any request building
// its own `size` to fetch "everything at once" (not a paged UI list) must cap
// at this, not a bigger number.
export const MAX_PAGE_SIZE = 100;

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
