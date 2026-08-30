# Contract Rules — Canonical Rulebook

Single source of truth for every rule ID cited by the skills in this pack. A skill may cite
a rule; it may not restate it with different wording. Architectural rationale lives in
`references/architecture.md`.

**Namespaces:** R.1 models · R.2 API · R.3 server state · R.4 components · R.5 routing &
pages · R.6 confirm actions · R.7 client state · R.8 forms · R.9 auth & session · R.10
errors · R.11 testing · P permissions · TS TypeScript · SEC security · PERF performance ·
DS design/i18n/a11y · SH shared layer

---

## R.1 — Models & schemas

| # | Rule | Violation |
|---|---|---|
| R.1.1 | All DTO types for a feature in `model/<entity>.types.ts` | DTOs split across files |
| R.1.2 | Form schema + mapper in `model/<entity>.schema.ts` | Schema inline in a component |
| R.1.3 | `FormValues` is `z.infer<typeof schema>` | Hand-written type beside the schema |
| R.1.4 | `<Entity>FormMapper` has `createEmpty`, `fromDto`, `toCreateRequest`, `toUpdateRequest` | Mapping scattered across components |
| R.1.5 | Update requests omit natural keys and parent FKs | `code` or `parentId` in an update |
| R.1.6 | `PagedResponse`, `SearchRequest`, `FilterCondition`, `SearchSort` imported from `data/types.ts` | Feature-local redefinition |
| R.1.7 | Field names, types, optionality mirror the backend response exactly | Renamed or "prettified" field |
| R.1.8 | Numeric mappings use `??`, never `\|\|` | `sortOrder \|\| undefined` turns `0` into `undefined` |
| R.1.9 | Filter operators reuse the shared union | Feature-invented operator string |
| R.1.10 | DTO and domain type are the same type unless a real transformation exists; if it does, the mapping lives in `model/` | Ceremonial domain layer that copies fields |

## R.2 — API layer

| # | Rule | Violation |
|---|---|---|
| R.2.1 | All HTTP through `lib/http/client.ts` | `fetch` or a second client elsewhere |
| R.2.2 | Feature endpoints grouped in `api/<entity>Api.ts` as async functions | URLs built inside a hook or component |
| R.2.3 | Base URL from `import.meta.env.VITE_API_URL` | Hardcoded host |
| R.2.4 | Envelope unwrapped once, centrally | `res.data.data` at a call site |
| R.2.5 | Non-2xx throws a normalised `ApiError` carrying `kind`, `status`, `errorCode`, `correlationId` | Returning `null`, throwing a bare `Error` |
| R.2.6 | API modules are pure I/O — no React, toast, navigation, or storage access | `toast.error()` in an api module |
| R.2.7 | Separate `activate(id)` / `deactivate(id)` | `toggleActive(id, active)` |
| R.2.8 | Paged reads use `POST /<resource>/search` with `SearchRequest` | Pagination over query string |
| R.2.9 | Every read forwards its `AbortSignal` to `fetch` | Un-cancellable request |
| R.2.10 | No retry, cache, or dedupe logic in the API layer | Hand-rolled retry loop |
| R.2.11 | Uploads use `FormData` with no `Content-Type` header; downloads go through `lib/http/download.ts` and revoke object URLs | Manual multipart boundary, leaked blob URLs |
| R.2.12 | 401 handling lives in the client's refresh queue only | Per-call 401 branch |

## R.3 — Server state (TanStack Query)

| # | Rule | Violation |
|---|---|---|
| R.3.1 | Server reads go through `useQuery` / `useSuspenseQuery` | `useEffect` + `fetch` |
| R.3.2 | Writes go through `useMutation` | `await api.create()` in a handler |
| R.3.3 | Keys come from the per-entity factory | Inline key array |
| R.3.4 | The whole `SearchRequest` is in the list key; no parallel pagination state | `useState(page)` beside a list query |
| R.3.5 | `staleTime` and `gcTime` declared per query | Relying on silent defaults |
| R.3.6 | Invalidation targets a factory key | Bare `invalidateQueries()` |
| R.3.7 | Independent data fetched in parallel | Request waterfall |
| R.3.8 | Child-collection mutations patch the cache with `setQueryData` where a refetch would flicker | Full refetch after adding one row |
| R.3.9 | Usage queries use `staleTime: 0` and are invalidated after any child mutation | Gating on stale `canDelete` |
| R.3.10 | Hooks named `use<Entity>List` / `use<Entity>` / `use<Entity>Mutations`, in `hooks/` | Ad-hoc names, hooks inside pages |
| R.3.11 | Toasts, navigation, and dialogs live in the caller's `mutate` callbacks | Side effect inside the hook |
| R.3.12 | Loading and error derive from `isPending` / `isError` | Mirrored into `useState` |
| R.3.13 | Mutations set `retry: false`; read retry is configured once in QueryClient defaults | Retrying a 403 |
| R.3.14 | Optimistic updates use `onMutate` → `cancelQueries` → snapshot → `onError` rollback → `onSettled` invalidate | Optimistic write with no rollback |
| R.3.15 | Paged lists use `placeholderData: keepPreviousData` | Table blanks between pages |
| R.3.16 | `QueryClient` is created once in `app/queryClient.ts` | `new QueryClient()` in a component body |

## R.4 — Components

| # | Rule | Violation |
|---|---|---|
| R.4.1 | Pages orchestrate; components in `components/` take props and never fetch | Data-fetching leaf component |
| R.4.2 | Memoisation is deliberate: `useMemo`/`useCallback`/`memo` carry a comment citing a referential-identity requirement or a measurement | Reflex `useCallback` on every handler |
| R.4.3 | Columns in `columns/<entity>Columns.tsx` as a factory taking the translation function | `ColumnDef[]` inline in a page |
| R.4.4 | List pages compose `useErpList()` + `DataTable` | Hand-rolled pager |
| R.4.5 | Row actions in their own component | Buttons inlined in a `cell` renderer |
| R.4.6 | Entry pages delegate fields to `<Entity>Form` | 400-line page component |
| R.4.7 | After create, `navigate(editPath, { replace: true })` | Extra history entry, full remount |
| R.4.8 | Every list renders pending, empty, filtered-empty, and error states | Blank screen while loading |
| R.4.9 | Modals and drawers unmount when closed and own their form instance | Hidden-but-mounted modal retaining stale values |
| R.4.10 | Route-identity changes reset component state via `key` | Stale form across `:id` changes |
| R.4.11 | User-facing errors go through `mapBackendError` + toast or inline slot | Raw `error.message` rendered |
| R.4.12 | `className` composed with `cx()` | Template-string concatenation |
| R.4.13 | No `dangerouslySetInnerHTML` outside a sanitising wrapper | Backend HTML injected directly |
| R.4.14 | Behaviour variants are a typed union prop or a compound component, never a growing set of independent booleans | `isCompact`, `isReadOnly`, `isCreateMode` stacked on one component |
| R.4.15 | A component with multiple internal parts that share implicit state exposes them as a compound component with an internal context, not a single component with a dozen pass-through props | `<DataTable rowActionsPosition sortIndicatorStyle emptyStateVariant …>` |

## R.5 — Routing & navigation

| # | Rule | Violation |
|---|---|---|
| R.5.1 | Routes are declared statically in `src/routes/routes.tsx`; no route, path, or menu item comes from an API | Runtime-generated route table |
| R.5.2 | Every URL string lives in `src/routes/paths.ts`; parameterised routes expose a builder and a pattern | Hand-written path at a call site |
| R.5.3 | Page components lazy-loaded per route with a `Suspense` fallback | Eager page import |
| R.5.4 | Every authenticated route sits inside `RequireAuth` and its own `RequirePermission` | Guard on the layout only |
| R.5.5 | Create and edit routes are guarded by CREATE and UPDATE, not the page's VIEW | Operation route inheriting VIEW |
| R.5.6 | Route params named `<entityCamel>Id` | `:id` on a nested resource |
| R.5.7 | Every route branch declares `errorElement`; a `*` route renders 404 | White screen on chunk failure |
| R.5.8 | List state (page, size, sort, filters, active tab) lives in URL search params | Filters lost on refresh |
| R.5.9 | Unauthenticated redirects to login with a return path; unauthorized renders an explicit 403 | Silent redirect to the dashboard |
| R.5.10 | Navigation is derived from the route config and filtered by held grants | Hardcoded menu, or a menu fetched from an API |
| R.5.11 | `AppShell` renders `<Outlet />`; the shell stays mounted across navigations | Shell remounting per screen |

## R.6 — Confirm actions

| # | Rule | Violation |
|---|---|---|
| R.6.1 | Handlers extracted to `helpers/<entity>ConfirmActions.ts` | Long inline handler |
| R.6.2 | Handlers take an explicit deps object | Importing singletons |
| R.6.3 | Permission checked first, before any dialog or await | Dialog then denial |
| R.6.4 | Usage (`canDelete` / `canDeactivate`) checked before the dialog | Confirm then server rejection |
| R.6.5 | Dialog intent: `warning` for activation changes, `danger` for delete | Everything `danger` |
| R.6.6 | Dialog copy from translation keys with interpolated params | Concatenated strings |

## R.7 — Client state (React Context)

| # | Rule | Violation |
|---|---|---|
| R.7.1 | Context holds cross-cutting client state only — never server data | Entity list cached in a provider |
| R.7.2 | One provider per concern (`LanguageContext` is the only cross-cutting Context — session/permissions are TanStack Query, AD-5) | A single god provider |
| R.7.3 | Context value is memoised so consumers do not re-render on every parent render | New object literal as `value` each render |
| R.7.4 | Consumers read through the provider's hook (`useLanguage`) | `useContext(RawContext)` at a call site |
| R.7.5 | Derived values computed at read time | Stored derivation that drifts from its source |
| R.7.6 | Only durable preferences persist, and never anything sensitive | Token or session payload written to storage |
| R.7.7 | No second client-state library alongside Context | A store duplicating an existing provider |

## R.8 — Forms

| # | Rule | Violation |
|---|---|---|
| R.8.1 | React Hook Form + `zodResolver`; `mode: 'onTouched'`, `reValidateMode: 'onChange'` | Ad-hoc validation on submit only |
| R.8.2 | Submission through `handleSubmit(onValid)` on the `<form>` element | Submit handler on a button's `onClick` |
| R.8.3 | Submit button is `type="submit"`; other buttons are `type="button"` | Cancel button submitting the form |
| R.8.4 | Server field errors map to `setError(field)`; form-level to `setError('root.serverError')` | Field errors shown only as a toast |
| R.8.5 | Fields render their error via the shared field components, linked with `aria-describedby` | Unlinked error text |
| R.8.6 | Submit disabled while `isSubmitting`; button shows a loading state | Double submission |
| R.8.7 | After a successful save, `reset(nextValues)` clears dirty state | Form stays dirty after saving |
| R.8.8 | Unsaved changes guarded with `useBlocker` on `isDirty` | Silent data loss on navigation |
| R.8.9 | Create and edit share one `<Entity>Form`; mode differences are props | Two divergent form components |
| R.8.10 | Immutable fields `disabled` in edit mode, never hidden | Editable natural key |
| R.8.11 | Defaults come from `FormMapper.createEmpty()` / `fromDto()` | Inline default literals |
| R.8.12 | Validation messages are translation keys resolved at render | English baked into the schema |
| R.8.13 | In a single-field form Enter submits; in a multi-field form Enter submits only from the last control; inside a `<textarea>`, Enter inserts a newline and `Cmd`/`Ctrl`+`Enter` submits | Enter submitting mid-form from a description `<textarea>` and eating the user's line break |

## R.9 — Auth & session

| # | Rule | Violation |
|---|---|---|
| R.9.1 | Access token in memory only, in `auth/tokenStore.ts` | Token in `localStorage`, `sessionStorage`, cookie readable by JS, or React state |
| R.9.2 | Refresh token in an httpOnly, Secure, SameSite cookie scoped to `/auth` | Refresh token reachable from JS |
| R.9.3 | Cookie-bearing requests send a double-submit `X-CSRF-Token` header | Unprotected cookie endpoint |
| R.9.4 | Startup bootstrap refreshes before rendering anything behind the auth boundary | Flash of authenticated UI then redirect |
| R.9.5 | 401 triggers one single-flight refresh; concurrent calls queue | Refresh storm, retry loop |
| R.9.6 | Failed refresh is a hard logout | Infinite retry |
| R.9.7 | Logout clears the token, clears the query cache, and broadcasts | Stale data visible to the next user |
| R.9.8 | Logout and session expiry synchronise across tabs via `BroadcastChannel` | One tab still "signed in" |
| R.9.9 | Session and permissions are a query at `staleTime: Infinity`, invalidated on auth events | Permissions copied into a store |
| R.9.10 | No credential, token, or permission set is ever logged or persisted | Token in console or analytics |

## R.10 — Errors

| # | Rule | Violation |
|---|---|---|
| R.10.1 | Every failure normalises to one of: `network`, `unauthenticated`, `forbidden`, `notFound`, `validation`, `conflict`, `server`, `unknown` | Untyped `catch (e: any)` |
| R.10.2 | Each kind has one defined user-facing behaviour (see `create-error-handling`) | Ad-hoc per-screen handling |
| R.10.3 | Displayed text comes from `mapBackendError(error)` → translation key | Backend message rendered verbatim |
| R.10.4 | Internal details — stack, SQL, class names, raw payloads — never reach the UI | Leaked exception text |
| R.10.5 | `correlationId` shown in the error UI when present, for support | Unreportable failure |
| R.10.6 | Route branches declare `errorElement`; the app root has a top-level boundary | Blank page on a render error |
| R.10.7 | Lists and widgets that can fail independently have their own boundary | One failed widget blanking the page |
| R.10.8 | `validation` errors route to the form, not to a toast alone | Field errors invisible |
| R.10.9 | Retry offered only for `network` and `server` | Retry button on a 403 |
| R.10.10 | Errors reported to monitoring are scrubbed of tokens, headers, and PII | Full request logged |

## R.11 — Testing

| # | Rule | Violation |
|---|---|---|
| R.11.1 | Schemas, mappers, and pure helpers have unit tests | Untested mapping logic |
| R.11.2 | API modules are tested against MSW handlers matching the backend contract | Hand-stubbed `fetch` |
| R.11.3 | Component tests assert user-visible behaviour via role and label queries | Asserting internal state or class names |
| R.11.4 | Each feature has integration tests for the list flow and the create/edit flow | Only unit tests |
| R.11.5 | Permission gating is tested for granted, denied, and deep-link cases | Untested authorization UX |
| R.11.6 | Auth is tested for bootstrap success, bootstrap failure, 401 refresh, and logout | Untested session edges |
| R.11.7 | No snapshot tests of whole components | Snapshot churn |
| R.11.8 | Tests never reach into implementation — no hook-internals tests, no store spying | Refactor-fragile suites |
| R.11.9 | One Playwright spec per critical flow (login, create, edit, delete, permission denial) | No end-to-end coverage |
| R.11.10 | Tests run against the real router and real QueryClient with a per-test client | Over-mocked test that proves nothing |

## P — Permissions

| # | Rule |
|---|---|
| P.1 | **Route layer** — `RequireAuth` + `RequirePermission` on every authenticated route, with the action that route performs |
| P.2 | **UI layer** — `<Can>` wraps every create, update, activation, and delete control, including inside table rows |
| P.3 | **Handler layer** — `can(...)` checked first in the handler, before any dialog or mutation |
| P.4 | **Naming** — `perm(RESOURCE, ACTION)` from `src/auth/permissions.ts`; never a concatenated literal |
| P.5 | **Consistency** — the same permission for the same action across all three layers |
| P.6 | **Navigation** — menu items filtered by held grants; a user never sees a link that would 403 |
| P.7 | **Hidden vs disabled** — unauthorized controls are hidden; controls unavailable for data reasons are disabled with a reason |
| P.8 | **Grants only** — the backend supplies the user's permission codes and nothing else about the UI; page inventory is a frontend fact (AD-2) |
| P.9 | **Boundary** — frontend authorization is UX; the backend is authoritative (AD-6) |

## TS — TypeScript

| # | Rule | Violation |
|---|---|---|
| TS.1 | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` enabled | Relaxed compiler options |
| TS.2 | No `any` in application code | `data: any` |
| TS.3 | No non-null assertion outside a guarded branch | `id!` with no prior check |
| TS.4 | `@ts-ignore` prohibited; `@ts-expect-error` allowed with a reason comment | Silent suppression |
| TS.5 | Props interfaces named and exported when reused | Inline anonymous props on shared components |
| TS.6 | Discriminated unions instead of optional-field soup | Six mutually exclusive optionals |
| TS.7 | Type guards are user-defined predicates, tested | Casting to force a shape |
| TS.8 | No unsafe cast across the API boundary | `as unknown as Dto` |
| TS.9 | Errors typed through `ApiError` and its `kind` union | `catch (e: any)` |
| TS.10 | Runtime validation at trust boundaries only — session payload and unions | Zod-parsing every DTO |
| TS.11 | Generic components constrain their parameters | `<T,>` with no bound where one is implied |
| TS.12 | Types imported with `import type` | Runtime import of a type-only module |

## SEC — Security

| # | Rule | Violation |
|---|---|---|
| SEC.1 | No token or credential in `localStorage`, `sessionStorage`, or a JS-readable cookie | Bearer token on disk |
| SEC.2 | `dangerouslySetInnerHTML` only through a sanitising component | Unsanitised backend HTML |
| SEC.3 | External links carry `rel="noopener noreferrer"` | Reverse tabnabbing |
| SEC.4 | User-controlled URLs validated against an allow-list before navigation or rendering | `javascript:` href |
| SEC.5 | Redirect targets after login validated as same-origin relative paths | Open redirect |
| SEC.6 | Only `VITE_`-prefixed public config in the client; no secrets in env, source, or bundle | API key in the bundle |
| SEC.7 | Uploads validated for type and size client-side, and always re-validated server-side | Client-only validation trusted |
| SEC.8 | Errors and logs never expose internals or PII | Stack trace in the UI |
| SEC.9 | Query cache cleared on logout | Previous user's data readable |
| SEC.10 | Dependencies audited in CI; new runtime dependencies require an entry in the ownership table | Unreviewed transitive risk |
| SEC.11 | Frontend checks are never the only enforcement of an authorization rule | "The button is hidden" as a control |
| SEC.12 | No sensitive value in a URL, search param, or `document.title` | Token in a query string |

## PERF — Performance

| # | Rule |
|---|---|
| PERF.1 | Route-level code splitting on every page |
| PERF.2 | Heavy widgets (rich text, signature, charts, file preview) dynamically imported |
| PERF.3 | Icons are `@tabler/icons-webfont` CSS glyph classes (`ti ti-<name>`); no second icon package imported |
| PERF.4 | No barrel chain that defeats tree-shaking |
| PERF.5 | Every memoisation justified in a comment; none applied by reflex |
| PERF.6 | Server-side pagination for every list; virtualization only above 200 rendered rows |
| PERF.7 | No parallelizable request chained behind another |
| PERF.8 | Images sized, lazy-loaded below the fold, and served in a modern format |
| PERF.9 | Suspense boundaries scoped so one slow query does not blank the page |
| PERF.10 | Performance fixes cite a measurement in the diff |

## DS — Design system, i18n, accessibility

| # | Rule | Violation |
|---|---|---|
| DS.1 | Compose from `components/ui` primitives | A second bespoke dialog or table |
| DS.2 | All colour, spacing, typography, and elevation values via `var(--token)` | Hardcoded hex or px |
| DS.3 | Class names follow `avl-<block>__<element>--<modifier>` | Ad-hoc or utility-framework classes |
| DS.4 | No inline `style` for anything a class expresses | `style={{ padding: 12 }}` |
| DS.5 | Every user-facing string is a `t()` key | Literal in JSX |
| DS.6 | Every key exists in both `en` and `ar`, with a documented fallback | Key in one dictionary |
| DS.7 | Layout uses logical CSS properties (`margin-inline-start`, `inset-inline-start`) | `margin-left`, `left` |
| DS.8 | Direction driven by `document.documentElement.dir` from `LanguageContext`; directional icons mirror | Per-component direction branching |
| DS.9 | Component props are explicit exported TypeScript interfaces | Inline anonymous props on shared components |
| DS.10 | Dates, numbers, currency via `Intl` with the active locale | `toFixed` and manual separators |
| DS.11 | Visible focus ring on every interactive element; motion respects `prefers-reduced-motion` | Removed outline |
| DS.12 | Semantic elements; icon-only controls carry `aria-label` | Clickable `div` |
| DS.13 | Dialogs and drawers trap focus, close on Escape, restore focus, and are labelled | Focus lost behind an overlay |
| DS.14 | Async status announced (`aria-live`, `aria-busy`) | Silent background update |
| DS.15 | Disabled controls explain why; unauthorized controls are hidden instead | Mystery disabled button |
| DS.16 | Primitives in `components/ui` never fetch data | Data-fetching primitive |
| DS.17 | A non-breaking space glues a number to its unit and a shortcut's keys together (`20&nbsp;MB`, `Ctrl&nbsp;+&nbsp;S`) | A unit or key combo that can wrap onto two lines |
| DS.18 | Animations drive only `transform` and `opacity`; `prefers-reduced-motion` disables non-essential motion | Animating `width`, `height`, `top`, or `left` |

## SH — Shared layer

| # | Resource | Location |
|---|---|---|
| SH.1 | `apiClient`, `http` | `lib/http` |
| SH.2 | `ApiError`, `normalizeError`, `mapBackendError` | `lib/errors` |
| SH.3 | `useLanguage()`, `t()` | `context/LanguageContext` |
| SH.4 | `usePermission()`, `useSession()` | `auth/permissions`, `auth/session` |
| SH.5 | `perm()`, `RESOURCES` | `auth/permissions` |
| SH.6 | `PATHS`, `NAV_SECTIONS`, `useVisibleNav()` | `routes/` |
| SH.7 | `RequireAuth`, `RequirePermission`, `<Can>` | `routes/guards`, `components/ui` |
| SH.8 | `PagedResponse`, `SearchRequest`, `FilterCondition`, `SelectOption` | `data/types.ts` |
| SH.9 | `Button`, `IconButton` | `components/ui/Button` |
| SH.10 | `Input`, `Select`, `Checkbox`, `Switch` | `components/ui/FormControls` |
| SH.11 | `Card`, `Stat`, `Badge`, `Avatar`, `DataTable` | `components/ui/DataDisplay` |
| SH.12 | `Alert`, `EmptyState`, `Tabs`, `Breadcrumb`, `Dialog`, `Drawer`, `Toast` | `components/ui/OverlaysAndFeedback` |
| SH.13 | `AppShell`, `Sidebar`, `Topbar` | `layout/` |
| SH.14 | `Intl` formatters | `lib/format` |

Never build a second: table, pager, dialog shell, toast system, empty state, field wrapper,
permission gate, error mapper, or date formatter. Extend the primitive instead.
