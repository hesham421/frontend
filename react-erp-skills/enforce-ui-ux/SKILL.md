---
name: enforce-ui-ux
description: "UI/UX, DESIGN SYSTEM, i18n AND ACCESSIBILITY ENFORCER — 42 checks on the token system token usage, dark mode, English/Arabic RTL correctness, loading/empty/error/disabled states, keyboard and focus behaviour, ARIA, dialog accessibility, locale-aware formatting, and motion. Use when reviewing any feature UI, adding user-facing strings, or verifying a screen in Arabic."
---

# Skill: enforce-ui-ux

## Description
Validates the presentation layer. Rules: `references/contract-rules.md` §DS, §R.4.
Accessibility findings outrank conflicting style rules (`erp-priority-override` O.1).

## When to Use
- Reviewing feature UI
- Adding user-facing strings
- Verifying a screen in Arabic / RTL
- Accessibility review

## When NOT to Use
- State ownership → `enforce-state-management`
- Structure → `enforce-frontend-architecture`
- Security → `enforce-security`

---

## Section 1 — Design system (7)

| # | Check | Violation |
|---|---|---|
| DS.1.1 | Composed from `components/ui` | A second bespoke picker or modal |
| DS.1.2 | Imported through the public surface | Deep path bypassing the barrel |
| DS.1.3 | `@theme` tokens for colour and spacing | `bg-[#4f46e5]` |
| DS.1.4 | `--elevation-*` tokens for elevation | Inline `boxShadow` |
| DS.1.5 | `cx()` composes conditional classes | Template-string concatenation |
| DS.1.6 | Palette respected — slate surfaces, indigo primary, violet accent | Ad-hoc brand colour |
| DS.1.7 | No inline `style` for anything the token system expresses | `style={{ padding: 12 }}` |

## Section 2 — Theming (4)

| # | Check |
|---|---|
| DS.2.1 | Dark variants via the `.dark` class variant, not a JS branch |
| DS.2.2 | Every surface, border, and text colour has a dark counterpart |
| DS.2.3 | Direction read from `useLanguage()`, not from the DOM |
| DS.2.4 | Contrast meets WCAG AA across token themes |

## Section 3 — i18n and RTL (10)

| # | Check | Violation |
|---|---|---|
| DS.3.1 | No literal user-facing string in JSX | `<h1>Branches</h1>` |
| DS.3.2 | Every key present in both `en` and `ar` | Key in one language |
| DS.3.3 | Validation messages are keys resolved at render | English in the schema |
| DS.3.4 | Logical direction utilities only | `ml-2`, `pr-4`, `text-left`, `left-0` |
| DS.3.5 | Directional icons flip with `dir` | Chevron wrong in Arabic |
| DS.3.6 | Table alignment and the actions column mirror together | Actions stuck on the wrong side |
| DS.3.7 | `dir` derived from `lang` and applied at the layout root | Divergent `dir` and `lang` |
| DS.3.8 | Arabic font applied globally, not per component | Component-level override |
| DS.3.9 | Interpolated params, never concatenation | `t('deleted') + ' ' + code` |
| DS.3.10 | Plurals handled by the dictionary | Naive `+ 's'` |

Page names are the exception: they come from the session payload, not the dictionary
resolved through `t()` like every other label.

## Section 4 — State coverage (7)

| # | Check |
|---|---|
| DS.4.1 | Pending renders `SkeletonLoader` shaped like the real content |
| DS.4.2 | Empty renders `EmptyState` with a title, hint, and primary action where useful |
| DS.4.3 | "No records" distinguished from "no matches for these filters", with a clear-filters action |
| DS.4.4 | Error renders mapped, translated copy with a correlation ID and retry where applicable |
| DS.4.5 | Buttons show a loading state and are disabled while their mutation is pending |
| DS.4.6 | Disabled controls explain why; unauthorized controls are hidden instead |
| DS.4.7 | Optimistic or in-flight rows are visually distinguishable |

## Section 5 — Keyboard and focus (6)

| # | Check |
|---|---|
| DS.5.1 | Visible focus ring on every interactive element |
| DS.5.2 | Full keyboard reachability — no mouse-only action |
| DS.5.3 | Logical tab order following visual order in both directions |
| DS.5.4 | Dialogs and drawers trap focus, close on Escape, and restore focus to the trigger |
| DS.5.5 | Enter submits a single-field form, or the last control of a multi-field one; a `<textarea>` treats plain Enter as a newline (R.8.13) |
| DS.5.6 | No positive `tabIndex` values |

## Section 6 — Semantics and ARIA (6)

| # | Check |
|---|---|
| DS.6.1 | Semantic elements — `button`, `table`, `nav`, ordered headings — not clickable `div`s |
| DS.6.2 | Icon-only controls carry `aria-label` |
| DS.6.3 | Inputs label-associated; errors linked with `aria-describedby` and `aria-invalid` |
| DS.6.4 | Dialogs labelled with `aria-labelledby` and `role="dialog"` / `aria-modal` |
| DS.6.5 | Async status announced with `aria-live`; busy regions marked `aria-busy` |
| DS.6.6 | ARIA used only where semantics fall short — never to patch a wrong element |

## Section 7 — Formatting and motion (6)

| # | Check |
|---|---|
| DS.7.1 | Dates, numbers, currency via `Intl` with the active locale |
| DS.7.2 | Numeric columns `tabular-nums` and end-aligned |
| DS.7.3 | Animations respect `prefers-reduced-motion` |
| DS.7.4 | Long lists paged; virtualization only above 200 rendered rows |
| DS.7.5 | Non-breaking space glues a number to its unit and a shortcut's keys together (DS.17) |
| DS.7.6 | Animations drive `transform`/`opacity` only, never `width`, `height`, `top`, or `left` (DS.18) |

---

## Automatic rejection triggers

| # | Trigger | Rule |
|---|---|---|
| 1 | Literal user-facing string | DS.3.1 |
| 2 | Key missing from `ar` | DS.3.2 |
| 3 | Physical direction utility | DS.3.4 |
| 4 | Arbitrary colour value | DS.1.3 |
| 5 | Component duplicating one in `components/ui` | DS.1.1 |
| 6 | Icon-only control without `aria-label` | DS.6.2 |
| 7 | Focus outline removed with no replacement | DS.5.1 |
| 8 | Clickable `div` where a `button` belongs | DS.6.1 |
| 9 | Dialog without focus trap, Escape, or restore | DS.5.4 |
| 10 | Raw error message rendered | DS.4.4 |
| 11 | Missing pending, empty, or error state | DS.4.1–DS.4.4 |
| 12 | Manual date or number formatting | DS.7.1 |
| 13 | Unauthorized control disabled rather than hidden | DS.4.6 |

## Arabic review checklist

Run the screen at `lang="ar"` / `dir="rtl"`:

- [ ] Nothing overflows or clips; no horizontal scrollbar
- [ ] Header, body, and actions column mirror together
- [ ] Chevrons, back arrows, and stepper progress point correctly
- [ ] Numbers and dates read correctly in the Arabic locale
- [ ] Drawers open from the correct side
- [ ] Sidebar collapse and nested indentation mirror
- [ ] No English fallback text anywhere
- [ ] Arabic font applied; no Latin-only font on Arabic text

Grep is faster than eyes for the mechanical part:

```bash
rg -n '\b(ml|mr|pl|pr)-[0-9]|text-(left|right)|\b(left|right)-[0-9]' src
```

RTL breaks most often because a single `ml-2` written from muscle memory passes review in
English and looks broken in Arabic.

## Keyboard review checklist

- [ ] Tab from the top reaches every control in visual order
- [ ] Every row action is reachable and activates with Enter or Space
- [ ] Opening a dialog moves focus into it; Escape closes; focus returns to the trigger
- [ ] Enter in any form field submits
- [ ] Focus is never lost to `document.body` after a delete or a filter change

## How to run

```bash
rg -n ">[A-Z][a-z]{3,}" src/features --glob '*.tsx'    # DS.3.1 literal-string candidates
diff <(jq -r 'paths(scalars)|join(".")' en.json|sort) \
     <(jq -r 'paths(scalars)|join(".")' ar.json|sort)  # DS.3.2
rg -n "bg-\[#|text-\[#" src                            # DS.1.3
rg -n "<div[^>]*onClick" src                           # DS.6.1
npx vitest run --project a11y                          # axe assertions
```

```
UI/UX & ACCESSIBILITY REPORT
Feature: <name>        Date: <date>
S1 DESIGN SYSTEM   [X/7]
S2 THEMING         [X/4]
S3 I18N & RTL      [X/10]
S4 STATE COVERAGE  [X/7]
S5 KEYBOARD/FOCUS  [X/6]
S6 SEMANTICS/ARIA  [X/6]
S7 FORMAT & MOTION [X/6]
TOTAL: XX/42
AUTOMATIC REJECTION: YES/NO
VIOLATIONS: [file:line — rule — fix]
VERDICT: APPROVED / APPROVED WITH WARNINGS / REJECTED
```

## Alignment with `vercel-labs/agent-skills`

Sections 5 and 6 (keyboard, focus, semantics, ARIA) are this project's implementation of
`web-design-guidelines`' Accessibility, Focus States, and Forms categories. Section 7 adds
two rules from that same skill not previously encoded here: non-breaking spaces on glued
terms (DS.7.5/DS.17 — a unit or shortcut must not wrap mid-string) and compositor-friendly
animation properties (DS.7.6/DS.18 — `transform`/`opacity` only, so motion doesn't trigger
layout on every frame). DS.5.5's Enter-submit check now also matches `web-design-guidelines`'
distinction between a single-control form, a multi-control form, and a `<textarea>` (R.8.13).

## Related skills
`create-components` · `create-forms` · `enforce-reusability` · `validate-frontend-feature`
