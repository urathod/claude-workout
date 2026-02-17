import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const rows = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, utcDate)));
  return rows.map((r) => ({
    ...r,
    date: new Date(r.date.getUTCFullYear(), r.date.getUTCMonth(), r.date.getUTCDate()),
  }));
}
