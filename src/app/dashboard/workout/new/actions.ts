"use server";

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { createWorkoutWithExercises } from "@/data/workouts";
import { redirect } from "next/navigation";
import { format } from "date-fns";

const setSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).optional(),
  weightLbs: z.string().optional(),
  rpe: z.string().optional(),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().uuid(),
  orderIndex: z.number().int().min(0),
  sets: z.array(setSchema),
});

const createWorkoutSchema = z.object({
  name: z.string().optional(),
  date: z.coerce.date(),
  notes: z.string().optional(),
  startTime: z.string().optional(),
  exercises: z.array(exerciseEntrySchema),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(
  input: CreateWorkoutInput
): Promise<{ error: string } | never> {
  const user = await currentUser();
  if (!user?.id) {
    return { error: "You must be signed in to create a workout." };
  }

  const parsed = createWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, date, notes, startTime, exercises } = parsed.data;

  let startedAt: Date | undefined;
  if (startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    startedAt = new Date(date);
    startedAt.setHours(hours, minutes, 0, 0);
  }

  let workout;
  try {
    workout = await createWorkoutWithExercises(user.id, {
      name: name || undefined,
      date,
      notes: notes || undefined,
      startedAt,
      exercises,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Failed to create workout: ${message}` };
  }

  redirect(`/dashboard?date=${format(workout.date, "yyyy-MM-dd")}`);
}
