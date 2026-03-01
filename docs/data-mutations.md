# Data Mutation Standards

## CRITICAL: Server Actions Only

**CRITICAL: ALL data mutations in this app MUST be done exclusively via Next.js Server Actions.**

- Do NOT mutate data in route handlers (`/app/api/`)
- Do NOT mutate data directly in client components
- Do NOT use `fetch` with POST/PUT/DELETE to custom API endpoints
- Do NOT call database functions directly from Server Components — mutations must go through server actions

Data must flow in one direction: **Client Component → Server Action → `/data` helper function → database**.

---

## Server Actions via Colocated `actions.ts` Files

All server actions must live in files named `actions.ts`, colocated alongside the page or feature that uses them.

### Rules

- Every server action file **MUST** start with `"use server";` at the top of the file
- Server action files **MUST** be named `actions.ts`
- Server action files **MUST** be colocated with the page/feature that uses them (e.g., `src/app/workouts/actions.ts`)
- Server actions **MUST NOT** contain database queries directly — they must call helper functions from `/data`

### Example Structure

```
src/app/
  /workouts/
    page.tsx
    actions.ts      ← server actions for the workouts page
  /exercises/
    page.tsx
    actions.ts      ← server actions for the exercises page
```

---

## Typed Parameters — No FormData

**Server action parameters MUST be explicitly typed. Do NOT use `FormData` as a parameter type.**

- Define explicit TypeScript types or interfaces for all action parameters
- Never accept `FormData` and manually extract values from it
- This ensures type safety and makes validation straightforward

### Bad — Do NOT Do This

```ts
"use server";

export async function createWorkout(formData: FormData) {
  const name = formData.get("name") as string; // ❌ Never do this
}
```

### Good — Do This

```ts
"use server";

export async function createWorkout(name: string, date: Date, userId: string) {
  // ✅ Explicitly typed parameters
}
```

---

## Argument Validation via Zod

**ALL server actions MUST validate their arguments using Zod before performing any mutation.**

- Every server action **MUST** define a Zod schema for its parameters
- Every server action **MUST** parse/validate the arguments against the schema before calling any `/data` helper
- If validation fails, return an error — do NOT proceed with the mutation

### Example

```ts
"use server";

import { z } from "zod";
import { createWorkoutForUser } from "@/data/workouts";
import { auth } from "@/auth";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

export async function createWorkout(name: string, date: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = createWorkoutSchema.parse({ name, date });

  await createWorkoutForUser(session.user.id, validated.name, validated.date);
}
```

---

## Database Mutations via `/data` Directory

All database mutations must live in helper functions under the `src/data/` directory — the same directory used for data fetching.

### Rules

- Every database mutation **MUST** be a named helper function in `src/data/`
- Helper functions **MUST** use **Drizzle ORM** — do NOT write raw SQL
- Helper functions **MUST** accept a `userId` (or equivalent authenticated identity) and scope all mutations to that user
- Never allow a mutation that affects another user's data

### Example Helper Function

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkoutForUser(
  userId: string,
  name: string,
  date: Date
) {
  return db.insert(workouts).values({ userId, name, date });
}
```

---

## Database Layer: Drizzle ORM

**ALL database interactions MUST use Drizzle ORM for type-safe database access.** Do NOT use raw SQL, Prisma, Knex, or any other ORM/query builder.

### Type-Safe Queries and Mutations

Use Drizzle's schema-inferred types for full type safety across inserts, selects, updates, and deletes:

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Use schema-inferred types for type-safe row data
type Workout = typeof workouts.$inferSelect;
type NewWorkout = typeof workouts.$inferInsert;

export async function createWorkoutForUser(
  userId: string,
  name: string,
  date: Date
): Promise<Workout> {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();
  return workout;
}

export async function updateWorkoutForUser(
  userId: string,
  workoutId: number,
  data: Partial<Pick<NewWorkout, "name" | "date">>
) {
  return db
    .update(workouts)
    .set(data)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function deleteWorkoutForUser(userId: string, workoutId: number) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

### Rules

- **Always** use Drizzle ORM — never raw SQL, Prisma, Knex, or other query tools
- **Always** use `$inferSelect` and `$inferInsert` from the schema for row types — do NOT manually define types that mirror table columns
- **Always** use Drizzle's query builder methods (`select`, `insert`, `update`, `delete`) — never string-interpolated queries
- **Always** use Drizzle's operator functions (`eq`, `and`, `or`, `gt`, etc.) for where clauses — never raw conditions
- **Always** scope every mutation by the authenticated `userId`
- **Never** pass the `db` instance or query builders to client components
- **Schema** lives in `@/db/schema` — do NOT duplicate table definitions

---

## Authorization: Users Must Only Mutate Their Own Data

This is a hard security requirement.

- Every helper function in `src/data/` **MUST** scope its mutation to the authenticated user's ID
- Never trust a `userId` passed from the client — always derive it from the server-side session inside the server action
- The server action is responsible for retrieving the session and passing the authenticated `userId` to the `/data` helper

---

## Summary

| Rule | Requirement |
|------|-------------|
| Mutation method | Server Actions only |
| Server action file name | `actions.ts`, colocated with the feature |
| File directive | `"use server";` at the top |
| Parameter types | Explicit TypeScript types — never `FormData` |
| Argument validation | Zod schema validation required on all actions |
| Database ORM | Drizzle ORM only — no raw SQL, Prisma, Knex, or other ORMs |
| Database types | `$inferSelect` / `$inferInsert` from schema — no manual type duplication |
| Database queries | Drizzle query builder + operator functions only |
| Database access | Via `src/data/` helpers — never directly in actions or components |
| Authorization | Always scope mutations to authenticated `userId` from session |
| Direct DB calls in actions | Never — always use `src/data/` helpers |
