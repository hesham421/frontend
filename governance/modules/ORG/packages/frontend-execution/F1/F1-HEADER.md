<!-- Source: PHASE:F1 / PREAMBLE (before first SUB) -->

# PHASE F1 — Frontend Model Specifications (v2.1 — CONFIRM against real API + Shell)

Open Questions: 3 active / see OQ Log above

**Responsibility applied:** models already used in the real UI Shell
(shell-manifest-ORG.md, `src/data/mockData.ts:200-279`) are confirmed against the
real API Docs' DTO shapes. Mismatches are corrected below; no field is added that
the Shell doesn't already need, except where the approved ui-ux-spec explicitly
requires it (audit footer) or the real API already returns it unused by the Shell.