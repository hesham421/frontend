/**
 * AVELYNQ EXTENSION — no upstream AVELYNQ spec exists, and no real usage
 * exists in the app yet (erp-autocomplete is a separate hand-rolled RxJS
 * implementation). Designed for future adoption per the Phase 3 brief,
 * pending human design review. Not wired into erp-autocomplete in this
 * phase — that component's rebuild is Phase 4 shared-component territory.
 */

export interface AvlTypeaheadDirective<T = unknown> {
  /** Search function — consumer owns debouncing/filtering, matching erp-autocomplete's existing RxJS pattern. */
  avlTypeahead: (term: string) => unknown; // Observable<T[]>
  /** Minimum characters before searching. */
  avlTypeaheadMinChars?: number;
}

export interface AvlTypeaheadSelectEvent<T = unknown> {
  item: T;
}

/**
 * Input + floating suggestion panel. The panel reuses AvlDropdown's exact
 * visual treatment (--surface-card / --border-subtle / --radius-md /
 * --shadow-md) so it reads as the same family as Dropdown.
 */
export declare class AvlTypeahead<T = unknown> {}
