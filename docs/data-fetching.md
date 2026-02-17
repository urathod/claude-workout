# Data Fetching Standards

## CRITICAL: Server Components Only

**ALL data fetching in this app MUST be done exclusively via React Server Components.**

- Do NOT fetch data in route handlers (`/app/api/`)
- Do NOT fetch data in client components (`"use client"`)
- Do NOT use `useEffect` + `fetch`, SWR, React Query, or any client-side data fetching pattern
- Do NOT use Next.js Route Handlers as a data layer

Data must flow in one direction: **database → `/data` helper function → Server Component → UI**.

---

## Database Queries via `/data` Directory

All database queries must live in helper functions under the `/data` directory.

### Rules

- Every database query **must** be a named helper function in `/data`
- Helper functions **must** use **Drizzle ORM** — do NOT write raw SQL
- Helper functions **must** accept a `userId` (or equivalent authenticated identity) and filter all queries by it
- Never expose a query that can return another user's data

### Example Structure

```
/data
  /workouts.ts
  /exercises.ts
  /progress.ts
```

### Example Helper Function

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

---

## Authorization: Users Must Only See Their Own Data

This is a hard security requirement.

- Every helper function in `/data` **must** scope its query to the authenticated user's ID
- Never query a table without a `userId` filter when the data is user-owned
- Never trust a `userId` passed from the client — always derive it from the server-side session

### Getting the Authenticated User

Always retrieve the user's identity server-side (e.g. from your auth session) before calling any `/data` helper:

```ts
// app/dashboard/page.tsx (Server Component)
import { auth } from "@/auth";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <WorkoutList workouts={workouts} />;
}
```

A logged-in user **must never** be able to access, view, or modify another user's data — even by manipulating a URL parameter or request payload.

---

## Summary

| Rule | Requirement |
|------|-------------|
| Data fetching location | Server Components only |
| Query method | Drizzle ORM via `/data` helpers |
| Raw SQL | Never |
| Route Handlers for data | Never |
| Client-side fetching | Never |
| User data isolation | Always filter by authenticated `userId` |
