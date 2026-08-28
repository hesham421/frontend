<!-- Source: PHASE:F1 / SUB:F1-SCR-SEC-004 -->
<!-- Context: see F1-HEADER.md for phase-level strategy, registry table, and intro -->


### F1-SCREEN — SCR-SEC-004 — Permission Registry

```
Shell status: CONFIRMED (Permissions.tsx, shell-manifest-SECURITY.md).

Entities touched:
  ENTITY-SEC-003 (Permission)    - primary list/create/edit subject
  ENTITY-SEC-004 (Page)          - "associated screen" field on the
                                    create/edit dialog; indirect module
                                    filter (see ENTITY-SEC-003 correction #1)

Local UI state (not entity-backed): search text, module filter (indirect,
confirmed AS-IS backend behavior — do not bind to a PermissionDto field),
create/edit dialog state. No delete action (confirmed, no correction —
matches real API's absence of a delete endpoint exactly).

FLAGGED (secondary point under the module gap already raised at
F1-MODEL ENTITY-SEC-003, not a new OQ): the shell-manifest's own
Renders line for this dialog lists "module" as one of its fields (name,
type, module, associated screen), but PermissionDto carries no writable
module field. SEC-FE must decide whether this dialog field is dropped
from the write payload entirely or repurposed as a page-search-only
filter feeding the "associated screen" picker.
```

