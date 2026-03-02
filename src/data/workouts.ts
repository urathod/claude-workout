import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
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

export async function createWorkoutWithExercises(
  userId: string,
  data: {
    name?: string;
    date: Date;
    notes?: string;
    startedAt?: Date;
    exercises: {
      exerciseId: string;
      orderIndex: number;
      sets: {
        setNumber: number;
        reps?: number;
        weightLbs?: string;
        rpe?: string;
      }[];
    }[];
  }
) {
  const utcDate = new Date(
    Date.UTC(data.date.getFullYear(), data.date.getMonth(), data.date.getDate())
  );

  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      name: data.name || null,
      date: utcDate,
      notes: data.notes || null,
      startedAt: data.startedAt || null,
    })
    .returning();

  if (data.exercises.length > 0) {
    const insertedExercises = await db
      .insert(workoutExercises)
      .values(
        data.exercises.map((ex) => ({
          workoutId: workout.id,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
        }))
      )
      .returning();

    const allSets = insertedExercises.flatMap((we, i) =>
      data.exercises[i].sets.map((s) => ({
        workoutExerciseId: we.id,
        setNumber: s.setNumber,
        reps: s.reps ?? null,
        weightLbs: s.weightLbs ?? null,
        rpe: s.rpe ?? null,
      }))
    );

    if (allSets.length > 0) {
      await db.insert(sets).values(allSets);
    }
  }

  return workout;
}
