"""
ERP Governance Tools — Frontend Configuration
================================================
Single source of truth for the FRONTEND toolset only.

This file has NO representation of "backend" anywhere except one
sanctioned cross-repo read, documented below. It has no --track flag,
no P4 concept, and no hardcoded module-name logic of any kind — no
denylist, no allowlist, no special case for any particular module.
Module identity is validated purely by looking the code up in the
published module registry; whatever is or isn't registered there is
whatever is or isn't reachable here. This file carries no historical
knowledge of any specific module — it is generic by construction.

The one sanctioned cross-repo read:
  BACKEND_REGISTRY_FILE — read-only, to validate a module exists.
  This reads shared/modules-registry.json, a copy backend PUBLISHES on
  every registry write (see backend's save_modules_registry) — it is
  not a path inside backend/governance/ itself. Neither track reaches
  into the other's internal tree for this.

API Docs are NOT read from backend at all — they live under this
repo's own modules/{MOD}/api-docs/, placed there manually (or by
whatever process publishes them) after real implementation. This
track never reaches into backend/governance/modules/ for anything.
"""

from pathlib import Path
import json
import re

# ─────────────────────────────────────────────
# REPO — Single root for this repo's own content. Derived from this
# file's own location, not hardcoded, so the repo works regardless of
# which machine/user account it's checked out under.
# ─────────────────────────────────────────────

REPO_BASE_PATH = Path(__file__).resolve().parent.parent

# The ONE sanctioned read into the published module registry —
# read-only, never written from this file. This repo maintains no
# module registry of its own; module identity truth lives entirely in
# backend, but this reads backend's PUBLISHED copy (a file backend
# writes specifically for other tracks to consume), not a path inside
# backend/governance/ itself — so neither track reaches into the
# other's internal directory tree. Derived relative to REPO_BASE_PATH
# so it stays correct on any machine.
BACKEND_REGISTRY_FILE = REPO_BASE_PATH.parent.parent / "shared" / "modules-registry.json"

# API Docs live inside this repo's own tree — modules/{MOD}/api-docs/
# — not inside backend's. Populated after real implementation; this
# track has no read path into backend/governance/modules/ at all.
API_DOCS_ROOT = REPO_BASE_PATH / "modules"


def get_api_docs_path(mod: str) -> Path:
    return API_DOCS_ROOT / mod.upper() / "api-docs"


# ─────────────────────────────────────────────
# MODULE VALIDATION — the only gate that can reject a module by
# identity. No denylist, no special-cased module name, anywhere.
# ─────────────────────────────────────────────

def load_backend_registry() -> dict:
    """
    Read-only load of backend's modules-registry.json. If it doesn't
    exist or isn't reachable, no module is valid — this repo has no
    fallback list of its own, by design.
    """
    if BACKEND_REGISTRY_FILE.exists():
        with open(BACKEND_REGISTRY_FILE, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {"modules": {}}


def validate_module(mod: str) -> str:
    """
    Validate a module code against backend's registry — the ONLY
    source of truth for which modules exist. A module not found here
    is rejected with a generic "not registered" message; there is no
    module-specific rejection message anywhere in this codebase,
    because there is no module-specific logic to produce one.
    """
    mod = mod.upper().strip()
    registry = load_backend_registry()
    if mod in registry.get("modules", {}):
        return mod

    raise ValueError(
        f"Module '{mod}' is not registered in backend's modules-registry.json.\n"
        f"This repo never registers modules itself — registration happens "
        f"only in the backend toolset. If this module should exist, register "
        f"it there first."
    )


# ─────────────────────────────────────────────
# MODULE FOLDER STRUCTURE — frontend stages only
# ─────────────────────────────────────────────

MODULE_STRUCTURE = {
    "P3_2":     "P3_2",      # Frontend Execution Plan
    "P3_5_FE":  "P3_5_FE",   # Frontend Test Plan
    "packages": "packages",
}

FRONTEND_STAGES = ("P3_2", "P3_5_FE")

# ─────────────────────────────────────────────
# ARTIFACT FILENAMES — exact names produced by the real governance
# engines (verified directly against PROJECT-3-FRONTEND-ENGINE.md)
# ─────────────────────────────────────────────

ARTIFACT_FILES = {
    "P3_2": [
        "frontend-execution-plan.md",
        "registry-exec-fe-{mod}.md",   # P-REG output
    ],
    "P3_5_FE": [
        "frontend-test-plan.md",
        "registry-test-fe-{mod}.md",   # P-REG output
    ],
}

# ─────────────────────────────────────────────
# PACKAGES STRUCTURE — frontend-execution-plan.md / frontend-test-plan.md splits
# ─────────────────────────────────────────────

PACKAGES_STRUCTURE = {
    "frontend-execution": [
        "F1",
        "F2",
        "F3",
        "F4",
        "SEC-FE",
        "ALIGN-FE",
    ],
    "frontend-test": [
        "UI-FLOWS",
        "INT-FLOW",
    ],
}

# ─────────────────────────────────────────────
# MARKER PATTERNS — identical to backend's copy; this syntax is
# neutral, it has no backend/frontend distinction at all
# ─────────────────────────────────────────────

MARKERS = {
    "phase":  re.compile(r"<!--\s*PHASE:(\w[\w-]*):(START|END)\s*-->"),
    "sub":    re.compile(r"<!--\s*SUB:([\w-]+):(START|END)\s*-->"),
    "api":    re.compile(r"<!--\s*API:(API-[\w-]+):(START|END)\s*-->"),
    "xm":     re.compile(r"<!--\s*XM:(XM-[\w-]+):(START|END)\s*-->"),
    "tc":     re.compile(r"<!--\s*TC:(TC-[\w-]+):(START|END)\s*-->"),
}

ALLOWED_PARENTS = {
    "phase": [None],
    "sub":   ["phase"],
    "api":   ["phase", "sub"],
    "xm":    ["phase", "sub"],
    "tc":    ["phase", "sub"],
}

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def get_module_path(mod: str) -> Path:
    """Root path for a module in THIS repo. Pure path resolution."""
    return REPO_BASE_PATH / "modules" / mod.upper()


def get_stage_path(mod: str, stage: str) -> Path:
    if stage not in MODULE_STRUCTURE:
        raise ValueError(f"Unknown frontend stage: {stage}. Valid: {list(MODULE_STRUCTURE.keys())}")
    return get_module_path(mod) / MODULE_STRUCTURE[stage]


def get_packages_path(mod: str, artifact: str, sub: str = "") -> Path:
    base = get_module_path(mod) / "packages" / artifact
    return base / sub if sub else base


def resolve_filename(template: str, mod: str) -> str:
    return template.replace("{mod}", mod.lower())


def ensure_module_structure(mod: str) -> list[Path]:
    """
    Create every frontend stage folder + packages subfolder for a
    module if missing — idempotent, safe to call from any tool. Never
    touches anything in backend/governance/.
    """
    created = []
    for stage in FRONTEND_STAGES:
        p = get_stage_path(mod, stage)
        if not p.exists():
            p.mkdir(parents=True, exist_ok=True)
            (p / ".gitkeep").touch()
            created.append(p)
    for artifact, subs in PACKAGES_STRUCTURE.items():
        for sub in subs:
            p = get_packages_path(mod, artifact, sub)
            if not p.exists():
                p.mkdir(parents=True, exist_ok=True)
                (p / ".gitkeep").touch()
                created.append(p)
    return created


def build_manifest(mod: str) -> dict:
    """
    This repo's own lightweight manifest — separate from backend's
    manifest.json for the same module (never merged, never synced).
    """
    base = get_module_path(mod)

    # Relative to REPO_BASE_PATH, never absolute — see the matching note
    # in backend's config.py. An absolute path here bakes in the
    # checking-out machine's home directory and this folder's name at
    # generation time, both of which differ across machines and drift
    # on any rename/move.
    def rel(p: Path) -> str:
        return str(p.relative_to(REPO_BASE_PATH))

    return {
        "module": mod,
        "status": {
            "archived": False,
            "split":    False,
        },
        "artifacts": {
            "p3_2":    rel(base / MODULE_STRUCTURE["P3_2"]),
            "p3_5_fe": rel(base / MODULE_STRUCTURE["P3_5_FE"]),
        },
        "registries": {
            "exec_fe": rel(base / MODULE_STRUCTURE["P3_2"] / f"registry-exec-fe-{mod.lower()}.md"),
            "test_fe": rel(base / MODULE_STRUCTURE["P3_5_FE"] / f"registry-test-fe-{mod.lower()}.md"),
        },
        "packages": {
            "frontend_execution": rel(base / "packages" / "frontend-execution"),
            "frontend_test":      rel(base / "packages" / "frontend-test"),
        },
    }
