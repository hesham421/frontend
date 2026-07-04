/**
 * AVELYNQ EXTENSION — no upstream AVELYNQ spec exists. Proposed by Phase 3
 * to replace the single real `<ngb-pagination>` usage
 * (erp-lookup-dialog.component.html), pending human design review.
 */

export interface AvlPaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  total: number;
  /** Control height — sm (30px) for compact contexts like a dialog footer, md (38px) for standalone toolbars. */
  size?: 'sm' | 'md';
  pageChange?: (page: number) => void;
}

/**
 * Token-styled prev/next + page-number control row. No CDK Overlay
 * needed. --control-sm/--control-md heights, --radius-md buttons,
 * --brand-primary active state.
 */
export declare class AvlPagination {}
