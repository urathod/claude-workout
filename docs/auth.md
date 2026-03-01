# Authentication Standards

## Provider: Clerk

**This app uses [Clerk](https://clerk.com) (`@clerk/nextjs`) for all authentication.** Do NOT use any other auth library (NextAuth, Auth.js, Lucia, custom JWT, etc.).

---

## Core Setup

### ClerkProvider

The `<ClerkProvider>` wraps the entire app in `src/app/layout.tsx`. Do NOT remove or replace it.

### Middleware

Clerk middleware is configured in `src/middleware.ts` using `clerkMiddleware()`. This runs on all routes except static assets. Do NOT replace this with custom auth middleware.

---

## Server-Side: Getting the Current User

In Server Components, always use `currentUser()` from `@clerk/nextjs/server` to get the authenticated user:

```ts
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    // Handle unauthenticated state
  }

  // user.id, user.username, user.fullName, etc.
}
```

### Rules

- **Always** call `currentUser()` in Server Components — never pass user identity from the client
- **Never** trust a user ID from URL params, form data, or client-side state for authorization
- When calling `/data` helper functions, derive the user identity from `currentUser()` on the server

---

## Client-Side: Clerk Components

Use Clerk's pre-built components for all auth UI. Do NOT build custom sign-in/sign-up forms.

### Available Components (from `@clerk/nextjs`)

| Component | Purpose |
|-----------|---------|
| `<SignInButton>` | Triggers sign-in flow |
| `<SignUpButton>` | Triggers sign-up flow |
| `<SignedIn>` | Renders children only when authenticated |
| `<SignedOut>` | Renders children only when unauthenticated |
| `<UserButton>` | Displays user avatar with account menu |

### Modal Mode

Always use `mode="modal"` on `<SignInButton>` and `<SignUpButton>` so auth flows open in a modal rather than navigating away:

```tsx
<SignInButton mode="modal">
  <Button>Sign In</Button>
</SignInButton>
```

### Client Component Wrapper

When Clerk components are used inside a Server Component, wrap them in a `"use client"` component:

```tsx
// AuthButtonsClient.tsx
"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex justify-center gap-3">
      <SignInButton mode="modal">
        <Button>Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button variant="outline">Sign Up</Button>
      </SignUpButton>
    </div>
  );
}
```

---

## Protecting Pages

### Auth Guard Pattern

For pages that require authentication, check for the user at the top of the Server Component and render an unauthenticated fallback if `currentUser()` returns `null`:

```tsx
export default async function ProtectedPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="text-center py-24">
        <h1>You are not signed in</h1>
        <p>Please sign in or create an account.</p>
        <AuthButtons />
      </main>
    );
  }

  // Authenticated content here
}
```

Do NOT redirect unauthenticated users — show an inline message with sign-in/sign-up buttons instead.

---

## TypeScript Types for Auth

Always use Clerk's built-in types. Do NOT create custom user types or re-define auth state types.

### User Type

The return type of `currentUser()` is `User | null` from `@clerk/nextjs/server`. Use this directly:

```ts
import { currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";

const user: User | null = await currentUser();
```

### Auth State in Components

When passing user data to child components, type props using Clerk's `User` type:

```ts
import type { User } from "@clerk/nextjs/server";

interface ProfileCardProps {
  user: User;
}
```

### Narrowing Auth State

After the null check, TypeScript narrows the type automatically. Always perform the null check before accessing user properties:

```ts
const user = await currentUser();

if (!user) {
  // user is null — render unauthenticated UI
  return <AuthButtons />;
}

// user is User — safely access properties
const userId: string = user.id;
const username: string | null = user.username;
const fullName: string | null = user.fullName;
const email: string | undefined = user.primaryEmailAddress?.emailAddress;
```

Do NOT use `as` type assertions or `!` non-null assertions to bypass null checks on user data. Always handle the `null` case explicitly.

---

## Server-Side Auth Verification Principles

### Key Principles

1. **Verify on every request** — Always call `currentUser()` or `auth()` at the top of every protected Server Component and API route. Never cache or store auth state across requests.
2. **Fail closed** — If `currentUser()` returns `null`, deny access immediately. Never fall through to authenticated logic.
3. **Derive, never trust** — The user identity must always come from Clerk's server-side functions. Never accept a user ID from query params, request body, cookies you set yourself, or client-side headers.
4. **Scope data access** — After verifying the user, pass `user.id` (or `user.username`) to `/data` helper functions. Every database query must be filtered by the authenticated user's identity.
5. **No auth shortcuts** — Do NOT skip auth checks because "middleware already handles it." Middleware controls route access; individual pages and API routes must still verify the user independently.

### `auth()` vs `currentUser()`

| Function | Returns | Use When |
|----------|---------|----------|
| `auth()` | `{ userId: string \| null }` | You only need the user ID (lighter weight) |
| `currentUser()` | `User \| null` | You need user details (name, email, avatar, etc.) |

Both are imported from `@clerk/nextjs/server`. Prefer `auth()` when you only need the ID:

```ts
import { auth } from "@clerk/nextjs/server";

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    return <AuthButtons />;
  }

  const workouts = await getWorkoutsForUser(userId);
  // ...
}
```

---

## API Routes (Route Handlers)

**Note:** Per `/docs/data-fetching.md`, data fetching must happen in Server Components, not Route Handlers. However, if an API route is needed (e.g., for webhooks or external integrations), follow these standards.

### Authenticating API Routes

Always use `auth()` from `@clerk/nextjs/server` in Route Handlers. Return a `401` response if the user is not authenticated:

```ts
// app/api/example/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Authenticated — use userId for data access
  return NextResponse.json({ userId });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  // Process with userId scoping...
  return NextResponse.json({ success: true });
}
```

### API Route Rules

- **Always** call `auth()` at the top of every Route Handler — never skip the auth check
- **Always** return `401 Unauthorized` for unauthenticated requests — do NOT return `403` or redirect
- **Never** use Route Handlers for data fetching that could be done in a Server Component
- **Never** create custom token validation or session checking — use Clerk's `auth()` exclusively
- **Scope all data** to the authenticated `userId` — same rules as Server Components

### Webhook Routes

For Clerk webhooks or third-party webhooks that don't have a Clerk session, verify the request using the webhook signature instead of `auth()`:

```ts
// app/api/webhooks/clerk/route.ts
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(request: Request) {
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Process verified webhook event...
  return new Response("OK", { status: 200 });
}
```

---

## Database Layer: Drizzle ORM

**All database interactions in authenticated contexts MUST use Drizzle ORM for type-safe queries and mutations.** Do NOT write raw SQL or use any other ORM/query builder.

### Auth + Database Flow

After verifying the user with Clerk, pass the authenticated identity to `/data` helper functions that use Drizzle:

```ts
// Server Component
import { currentUser } from "@clerk/nextjs/server";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function Page() {
  const user = await currentUser();
  if (!user) return <AuthButtons />;

  // Drizzle-powered query scoped to authenticated user
  const workouts = await getWorkoutsForUser(user.id);
}
```

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

export async function createWorkoutForUser(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}

export async function deleteWorkoutForUser(userId: string, workoutId: number) {
  return db.delete(workouts).where(
    and(eq(workouts.id, workoutId), eq(workouts.userId, userId))
  );
}
```

### Rules

- **Always** use Drizzle ORM — never raw SQL, Prisma, Knex, or other query tools
- **Always** scope queries and mutations by the authenticated `userId`
- **Never** pass Drizzle query builders or the `db` instance to client components
- **Schema types** come from `@/db/schema` — do NOT duplicate or manually define table types
- Use Drizzle's inferred types (`typeof workouts.$inferSelect`, `typeof workouts.$inferInsert`) for type-safe row data when needed

---

## Environment Variables

Clerk requires the following environment variables (stored in `.env.local`, never committed):

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Do NOT hardcode these values. Do NOT commit `.env.local` to version control.

---

## Summary

| Rule | Requirement |
|------|-------------|
| Auth provider | Clerk (`@clerk/nextjs`) only |
| Server-side user identity | `currentUser()` or `auth()` from `@clerk/nextjs/server` |
| Client-side auth UI | Clerk components (`SignInButton`, `SignUpButton`, etc.) |
| Sign-in/sign-up mode | Always `mode="modal"` |
| Custom auth forms | Never |
| Trusting client-side user ID | Never |
| User types | Use `User` from `@clerk/nextjs/server` — no custom types |
| Type assertions on user data | Never — always handle `null` explicitly |
| Auth verification | Every protected page and API route, independently |
| API route auth | `auth()` + return `401` if unauthenticated |
| API routes for data fetching | Never — use Server Components |
| Webhook verification | Svix signature verification, not `auth()` |
| Database layer | Drizzle ORM only — no raw SQL or other ORMs |
| DB query scoping | Always filter by authenticated `userId` |
| Auth middleware | `clerkMiddleware()` in `src/middleware.ts` |
| Environment variables | `.env.local` only, never committed |
