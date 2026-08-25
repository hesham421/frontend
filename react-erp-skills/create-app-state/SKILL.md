---
name: create-app-state
description: "Generates cross-cutting client state as React Context providers — LanguageContext for locale, direction and t(), AuthContext for session and grants — and defines precisely which state belongs there versus in TanStack Query, React Hook Form, URL search params, or useState."
---

# Skill: create-app-state

## Description
Generates the application's Context providers and settles state ownership.
Implements AD-5, AD-7. Rules: `references/contract-rules.md` §R.7.

## When to Use
- Locale, direction, theme, session, or grants need to be readable across the tree
- Deciding where a new piece of state belongs
- Reviewing a provider for re-render or ownership problems

## When NOT to Use
- Server data → `create-queries`
- Form fields → `create-forms`
- List page, size, sort, filters, active tab → URL search params (R.5.8)
- State read by one subtree → `useState` and props

## Output

```
src/context/LanguageContext.tsx
src/context/AuthContext.tsx
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

Only locale/direction and session/grants clear all six. That is why there are exactly two
providers and no general-purpose store: a third provider needs to justify itself against
this list.

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

## Step 2 — AuthContext

The session comes from a query (AD-5); Context is the read surface so `useAuth` and `useCan`
are the only ways to reach it.

```tsx
interface AuthContextValue {
  status: 'loading' | 'authenticated' | 'anonymous';
  user: SessionUser | null;
  can: (permission: string) => boolean;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending, isError } = useSessionQuery();   // staleTime: Infinity

  const granted = useMemo(() => new Set(data?.permissions ?? []), [data]);

  const can = useCallback((permission: string) => granted.has(permission), [granted]);

  const value = useMemo<AuthContextValue>(() => ({
    status: isPending ? 'loading' : isError || !data ? 'anonymous' : 'authenticated',
    user: data?.user ?? null,
    can,
  }), [isPending, isError, data, can]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => { /* throws outside the provider */ };
export const useCan = () => useAuth().can;
```

The permission set is a `Set`, not an array: `can()` runs on every guarded control on every
render, and a linear scan over a few hundred grants in a table of fifty rows is measurable.

**The token is not here.** It is never rendered, so putting it in Context adds a re-render
surface and a way for it to leak into a component tree for no benefit (AD-4).

## Step 3 — Provider composition

Order matters — inner providers may consume outer ones.

```tsx
// main.tsx
<QueryClientProvider client={queryClient}>   {/* AuthProvider's session query needs this */}
  <LanguageProvider>                          {/* AuthProvider may render translated errors */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </LanguageProvider>
</QueryClientProvider>
```

## Step 4 — Consuming

```tsx
const { t, dir } = useLanguage();
const can = useCan();
```

Never `useContext(LanguageContext)` at a call site (R.7.4). The hook is where the
outside-provider check lives, and routing every read through it means the context object
itself can be refactored without touching consumers.

## When a third provider is justified

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
