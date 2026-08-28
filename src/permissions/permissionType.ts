// LOV-SEC-001 — permissionType is stored as a Java enum (@Enumerated(STRING)),
// not read from MD_LOOKUP_DETAIL like standard LOV-1/LOV-4 value sets
// (srs.md ENTITY-SEC-003, confirmed real-API deviation — permanent, not a
// gap). No runtime lookup endpoint exists or should be invented (HR-1).
// Single shared source — never re-declared ad hoc in a component.
export const PERMISSION_TYPES = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] as const;
export type PermissionType = (typeof PERMISSION_TYPES)[number];
