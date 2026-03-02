import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, isNull, or, asc } from "drizzle-orm";

export async function getExercisesForUser(userId: string) {
  return db
    .select()
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, userId)))
    .orderBy(asc(exercises.name));
}

export async function getAllExercises() {
  return db.select().from(exercises).orderBy(asc(exercises.name));
}
