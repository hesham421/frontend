// LOV-SEC-002 — DATA_ACCESS_LEVEL, a real MasterDataLookupClient-validated
// value set (MD_MASTER_LOOKUP), unlike LOV-SEC-001. No runtime options-list
// endpoint exists in the confirmed 50-endpoint API surface (srs.md: "SOFT-
// READ فقط، بلا XM-ID مؤكَّد بعد" — soft-read only, no confirmed XM-ID yet).
// Hardcoded pending a real lookup-list read — a TEMPORARY gap, not a
// permanent deviation like LOV-SEC-001. Replace with a real fetch if
// MD_MASTER_LOOKUP's read endpoint becomes available.
export const DATA_ACCESS_LEVELS = ['BRANCH_ONLY', 'BRANCH_AND_CHILDREN', 'ALL'] as const;
export type DataAccessLevel = (typeof DATA_ACCESS_LEVELS)[number];
