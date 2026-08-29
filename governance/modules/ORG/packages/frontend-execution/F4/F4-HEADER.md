<!-- Source: PHASE:F4 / PREAMBLE (before first SUB) -->

# PHASE F4 — Frontend Routing & Component Structure (v2.1 — DOCUMENT + INTEGRATE)

Open Questions: 3 active / see OQ Log above

**Responsibility applied:** documents the Shell's real, existing structure
(shell-manifest-ORG.md) for every SCR-ID, and flags integration gaps explicitly
rather than redesigning what already exists. Per the Shell's own structural note,
there is no react-router route tree in this repo — navigation is a `currentScreen`
string switched in `src/App.tsx`. Both the F4-RULE-1 target path convention AND the
Shell's current screen-key are documented below so neither fact is lost.