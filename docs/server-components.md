# Server Component Standards

## CRITICAL: Component Structure

Every page Server Component **MUST** follow this execution order:

1. **Authentication** — call `currentUser()` first, before anything else
2. **Auth guard** — if not authenticated, return fallback UI with `<AuthButtons />`
3. **Parse params** — `await params` or `await searchParams` (both are `Promise` in Next.js 16)
4. **Fetch data** — call `/data` helper functions with authenticated `userId`
5. **Handle missing data** — call `notFound()` for resources that don't exist
6. **Return JSX** — render the page UI

---

## Authentication Pattern

Every protected page must independently check auth. Do NOT rely on layout-level auth checks.

```tsx
import { currentUser } from "@clerk/nextjs/server";
import { AuthButtons } from "../../AuthButtonsClient";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-semibold">You are not signed in</h1>
        <p className="text-muted-foreground">
          Please sign in or create an account to access this page.
        </p>
        <AuthButtons />
      </main>
    );
  }

  // Authenticated logic...
}
```

### Rules

- **MUST** call `currentUser()` as the first operation in every protected page
- **MUST** return inline auth UI — do NOT redirect to a login page
- **MUST** use `<AuthButtons />` client component for Clerk sign-in/sign-up buttons

---

## Async Params (Next.js 16)

In Next.js 16, both `params` and `searchParams` are `Promise` types and **MUST** be awaited before use.

### Dynamic Route Params

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
}
```

### Search Params

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
}
```

### Rules

- **MUST** type as `Promise<{ ... }>` — not a plain object
- **MUST** `await` before destructuring
- **MUST** parse params after the auth check, not before

---

## Data Fetching

All data fetching happens in Server Components by calling `/data` helper functions. See `data-fetching.md` for full details.

```tsx
const workouts = await getWorkoutsForUserOnDate(user.id, selectedDate);
```

### Rules

- **MUST** pass the authenticated `user.id` to every data helper
- **MUST** handle null/empty results (use `notFound()` for missing single resources)
- Do NOT fetch data in client components

---

## Not Found Handling

Use `notFound()` from `next/navigation` when a fetched resource doesn't exist.

```tsx
import { notFound } from "next/navigation";

const workout = await getWorkoutWithExercises(user.id, workoutId);

if (!workout) {
  notFound();
}
```

---

## Client Component Boundaries

When a Server Component needs interactive or Clerk UI elements, extract them into a separate client component file.

### Rules

- Client component files **SHOULD** use a `Client` suffix (e.g. `AuthButtonsClient.tsx`)
- Client components **MUST** have `"use client"` directive at the top
- Server Components pass data down as props — client components never fetch data

---

## Import Order

Organize imports in this order:

1. Auth — `@clerk/nextjs/server`
2. Next.js — `next/link`, `next/navigation`
3. UI components — `@/components/ui/*`
4. Icons — `lucide-react`
5. Data helpers — `@/data/*`
6. Client sub-components — local `./` imports
7. Utilities — `date-fns`, `@/lib/utils`

---

## Page Layout Conventions

- Wrap page content in `<main>` with max-width constraint (`max-w-2xl mx-auto px-4 py-8`)
- Use a back navigation link with `<ArrowLeft>` icon for sub-pages
- Use `space-y-*` for vertical spacing between sections

```tsx
return (
  <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
    <div className="flex items-center gap-2">
      <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="text-2xl font-semibold">Page Title</h1>
    </div>

    {/* Page content */}
  </main>
);
```

---

## Summary

| Rule | Requirement |
|------|-------------|
| Auth check | `currentUser()` as first operation in every protected page |
| Auth fallback | Inline UI with `<AuthButtons />` — no redirects |
| Params typing | `Promise<{ ... }>` — must `await` before use |
| Params order | Parse after auth check |
| Data fetching | `/data` helpers only, always pass `userId` |
| Missing resources | `notFound()` from `next/navigation` |
| Client boundaries | Separate file with `"use client"`, `Client` suffix |
| Import order | Auth → Next.js → UI → Icons → Data → Local → Utils |
| Layout | `<main>` with max-width, back link, `space-y-*` spacing |
