---
name: create-app-state
description: "Generates cross-cutting client state as React Context providers — LanguageContext for locale, direction and t() — and defines precisely which state belongs there versus in TanStack Query, React Hook Form, URL search params, or useState. Session and permissions look cross-cutting but stop at TanStack Query (AD-5, create-auth-session) and never reach Context."
---

# Skill: create-app-state

## Description
Generates the application's Context providers and settles state ownership.
Implements AD-5, AD-7. Rules: `references/contract-rules.md` §R.7.

## When to Use
- Locale, direction, or theme needs to be readable across the tree
- Deciding where a new piece of state belongs
- Reviewing a provider for re-render or ownership problems

## When NOT to Use
- Server data, including session and permissions → `create-queries`, `create-auth-session`
- Form fields → `create-forms`
- List page, size, sort, filters, active tab → URL search params (R.5.8)
- State read by one subtree → `useState` and props

## Output

```
src/context/LanguageContext.tsx
```

---

## The ownership decision, in order

Ask these in sequence and stop at the first yes. Most instincts to "make it global" stop
before reaching Context.

| # | Question | Owner |
|---|---|---|
| 1 | Does a server own the truth? | TanStack Query |
| 2 | Is it a credential? | `auth/tokenStore.ts` — module memory, never Context or storage |
| 3 | Is the user editing it in a form right now? | React Hook Form |
| 4 | Should a reload preserve it, or a link reproduce it? | URL search params |
| 5 | Is it read by one subtree? | `useState` + props |
| 6 | Is it cross-cutting and read almost everywhere? | **Context** |

Session and permissions look cross-cutting and read-everywhere, which is why they're the
case worth naming explicitly: they stop at question 1 — a server owns that truth — and
never reach question 6, so they live in TanStack Query via `usePermission()`
(`create-auth-session`, AD-5), not here. Only locale/direction clears all six. That is why
there is exactly one provider and no general-purpose store: a second provider needs to
justify itself against this list.

## Step 1 — LanguageContext

```tsx
type Language = 'en' | 'ar';

interface LanguageContextValue {
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem('avl-lang') as Language) ?? 'en',
  );

  // direction is DERIVED, never stored separately — R.7.5
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem('avl-lang', lang);   // a durable preference, not sensitive — R.7.6
    setLanguageState(lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const raw = dictionaries[language][key] ?? dictionaries.en[key] ?? key;   // documented fallback
    return params
      ? raw.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
      : raw;
  }, [language]);

  // memoised so every consumer does not re-render on each parent render — R.7.3
  const value = useMemo(() => ({ language, dir, setLanguage, t }), [language, dir, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
```

Three things carry weight here:

- **`dir` is derived from `language`, not stored.** Two fields that must be kept in sync eventually will not be, and the failure is a screen that reads left-to-right in Arabic.
- **The value is memoised.** An unmemoised object literal as `value` is a new reference every render, so every consumer in the tree re-renders on any parent update. In a provider this high, that is the whole application.
- **The fallback chain is `ar → en → key`.** Returning the key makes a missing translation visible in development rather than rendering an empty string in production.

The provider throws when used outside itself. Returning `undefined` pushes an optional-chaining burden onto every call site and turns a wiring mistake into a silent blank label.

## Step 2 — Why session/permissions stop here, not in Context

This is worth stating explicitly because a session-in-Context wrapper is a common tutorial
pattern that looks like it belongs in this file. It doesn't:

- The session (`user`, `permissions`, `pages`) is already single-sourced by the TanStack
  Query cache (`useSession()`, `staleTime: Infinity`) — see `create-auth-session` Step 4.
  A Context wrapper on top would be a second read path for data with exactly one owner
  already, not a second owner (which R.7.1 would reject), but still pure overhead: every
  consumer of `usePermission()` already gets the same single source, without an extra
  provider, an extra `useContext` throw-guard, or an extra memoised `value` object to keep
  correct.
- The permission set is read via `const { can } = usePermission()` directly
  (`auth/permissions.ts`) — same call shape as `useLanguage()`, just backed by a query
  instead of a provider.
- **The token is not here either**, and never will be: it is never rendered, so putting it
  anywhere React can see it adds a re-render surface and a leak path for no benefit (AD-4).

If a genuinely new cross-cutting concern shows up that a server does *not* already own
(theme, a feature flag set fetched once and rarely changing), it goes through the same
six-question test above — and if it clears all six, it becomes this file's second provider.

## Step 3 — Provider composition

```tsx
// main.tsx
<QueryClientProvider client={queryClient}>   {/* usePermission()'s session query needs this */}
  <LanguageProvider>
    <App />
  </LanguageProvider>
</QueryClientProvider>
```

## Step 4 — Consuming

```tsx
const { t, dir } = useLanguage();
const { can } = usePermission();
```

Never `useContext(LanguageContext)` at a call site (R.7.4). The hook is where the
outside-provider check lives, and routing every read through it means the context object
itself can be refactored without touching consumers.

## When a second provider is justified

Rarely. A candidate must clear all six ownership questions and be read across unrelated
branches of the tree. A theme provider qualifies if theming ever becomes user-selectable.
A "current record" provider does not — that is server state with a URL parameter.

If a provider's value changes frequently — anything updating per keystroke or per scroll —
Context is the wrong tool, because every consumer re-renders. Keep it local and pass props.

## Verify before finishing

- [ ] No server data held in a provider
- [ ] No token in Context or storage
- [ ] Derived values computed, not stored
- [ ] Every provider value memoised
- [ ] Consumers read through the provider's hook, which throws outside it
- [ ] Only durable, non-sensitive preferences persisted
- [ ] Provider order satisfies inter-provider dependencies
- [ ] One provider per concern; no god provider

## Violations requiring immediate rejection

| Pattern | Rule |
|---|---|
| Entity data or query results held in a provider | R.7.1 |
| A single provider covering unrelated concerns | R.7.2 |
| Unmemoised `value` object | R.7.3 |
| `useContext(RawContext)` at a call site | R.7.4 |
| `dir` stored alongside `language` | R.7.5 |
| Token or session payload written to storage | R.7.6, SEC.1 |
| A second client-state library alongside Context | R.7.7 |
| Pagination or filters held in a provider | R.5.8 |

## Alignment with general React guidance

**Consistent with:** the documented provider pattern, memoised context values, custom hooks
that assert provider presence, splitting rapidly-changing state out of Context.

**Deliberately different:** adding a state library alongside these providers is rejected —
it would create a second owner for the same concern, and this application's client state is
small, changes rarely, and is read almost everywhere, which is precisely the shape Context
handles well.
