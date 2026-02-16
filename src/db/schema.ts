import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// exercises  --  exercise catalog (global + user-created)
// ---------------------------------------------------------------------------
export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    // null = global/seeded exercise visible to all users
    // non-null = user-created custom exercise
    userId: text("user_id"),
    name: text("name").notNull(),
    muscleGroup: text("muscle_group"),
    category: text("category"),
    equipmentType: text("equipment_type"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("exercises_user_id_idx").on(table.userId),
    uniqueIndex("exercises_user_name_unique_idx").on(table.userId, table.name),
  ]
);

// ---------------------------------------------------------------------------
// workouts  --  a single training session
// ---------------------------------------------------------------------------
export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id").notNull(),
    name: text("name"),
    date: date("date", { mode: "date" }).notNull(),
    notes: text("notes"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // total session duration in seconds
    duration: integer("duration"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("workouts_user_id_idx").on(table.userId),
    index("workouts_date_idx").on(table.date),
    index("workouts_user_date_idx").on(table.userId, table.date),
  ]
);

// ---------------------------------------------------------------------------
// workout_exercises  --  one exercise entry within a workout
// ---------------------------------------------------------------------------
export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "restrict" }),
    // controls display order of exercises within a workout
    orderIndex: integer("order_index").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("we_workout_id_idx").on(table.workoutId),
    index("we_exercise_id_idx").on(table.exerciseId),
  ]
);

// ---------------------------------------------------------------------------
// sets  --  one set within a workout_exercise
// ---------------------------------------------------------------------------
export const sets = pgTable(
  "sets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    workoutExerciseId: uuid("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    reps: integer("reps"),
    weightLbs: numeric("weight_lbs", { precision: 6, scale: 2 }),
    // for timed exercises (e.g. planks)
    durationSeconds: integer("duration_seconds"),
    // Rate of Perceived Exertion: 1.0 – 10.0
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    // rest period after this set, in seconds
    restTime: integer("rest_time"),
    // null = planned/not yet logged; non-null = completed
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    index("sets_workout_exercise_id_idx").on(table.workoutExerciseId),
  ]
);

// ---------------------------------------------------------------------------
// Relations  (enables db.query.* relational API)
// ---------------------------------------------------------------------------
export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExercises.workoutId],
      references: [workouts.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(sets),
  })
);

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ---------------------------------------------------------------------------
// Inferred TypeScript types
// ---------------------------------------------------------------------------
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
