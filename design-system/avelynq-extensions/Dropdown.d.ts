/**
 * AVELYNQ EXTENSION — no upstream AVELYNQ spec exists for this component.
 * Proposed by Phase 3 (interactive-component migration off ng-bootstrap),
 * pending human design review. Written in the same tone/structure as
 * design-system/avelynq-source/components/buttons/Button.d.ts, adapted to
 * Angular directive/@Input/@Output conventions instead of React props.
 */

export interface AvlDropdownDirective {
  /** Host directive on the containing element (e.g. `<li avlDropdown>`) — owns open/close state. */
  avlDropdown: true;
}

export interface AvlDropdownToggleDirective {
  /** Marks the trigger element; click toggles the parent avlDropdown open/closed and anchors the overlay to it. */
  avlDropdownToggle: true;
}

export interface AvlDropdownItemDirective {
  /** Marks a button/anchor inside the panel as a selectable item — closes the panel on click. */
  avlDropdownItem: true;
}

/**
 * Floating menu anchored to a trigger element (CDK Overlay, connected
 * position with viewport-edge fallbacks). Reuses Dialog's surface
 * treatment (surface-card / border-subtle / radius-md) at a smaller
 * footprint with shadow-md instead of shadow-xl, and no scrim (a
 * transparent backdrop only, for outside-click detection).
 */
export declare class AvlDropdown {}
export declare class AvlDropdownToggle {}
export declare class AvlDropdownItem {}
