import { db } from "@/db";
import { workouts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getWorkoutsForUserOnDate(userId: string, date: Date) {
  return db
    .select()
    .from(workouts)
//    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)));
    .where(and(eq(workouts.userId, userId)));
}
