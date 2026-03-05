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

export async function getWorkoutWithExercises(userId: string, workoutId: string) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        with: {
          exercise: true,
          sets: true,
        },
        orderBy: (we, { asc }) => [asc(we.orderIndex)],
      },
    },
  });

  if (!workout) return null;

  return {
    ...workout,
    date: new Date(
      workout.date.getUTCFullYear(),
      workout.date.getUTCMonth(),
      workout.date.getUTCDate()
    ),
  };
}

export type WorkoutWithExercises = NonNullable<
  Awaited<ReturnType<typeof getWorkoutWithExercises>>
>;

export async function updateWorkoutWithExercises(
  userId: string,
  workoutId: string,
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

  // Update the workout row (scoped by userId)
  const [workout] = await db
    .update(workouts)
    .set({
      name: data.name || null,
      date: utcDate,
      notes: data.notes || null,
      startedAt: data.startedAt || null,
      updatedAt: new Date(),
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  if (!workout) {
    throw new Error("Workout not found");
  }

  // Delete existing exercises (cascade deletes sets)
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  // Re-insert exercises and sets
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
