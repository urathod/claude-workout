import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { exercises } from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

const globalExercises = [
  // Chest
  { name: "Bench Press", muscleGroup: "Chest", category: "Compound", equipmentType: "Barbell" },
  { name: "Incline Bench Press", muscleGroup: "Chest", category: "Compound", equipmentType: "Barbell" },
  { name: "Dumbbell Bench Press", muscleGroup: "Chest", category: "Compound", equipmentType: "Dumbbell" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", category: "Compound", equipmentType: "Dumbbell" },
  { name: "Cable Fly", muscleGroup: "Chest", category: "Isolation", equipmentType: "Cable" },
  { name: "Dumbbell Fly", muscleGroup: "Chest", category: "Isolation", equipmentType: "Dumbbell" },
  { name: "Push Up", muscleGroup: "Chest", category: "Compound", equipmentType: "Bodyweight" },

  // Back
  { name: "Deadlift", muscleGroup: "Back", category: "Compound", equipmentType: "Barbell" },
  { name: "Barbell Row", muscleGroup: "Back", category: "Compound", equipmentType: "Barbell" },
  { name: "Pull Up", muscleGroup: "Back", category: "Compound", equipmentType: "Bodyweight" },
  { name: "Chin Up", muscleGroup: "Back", category: "Compound", equipmentType: "Bodyweight" },
  { name: "Lat Pulldown", muscleGroup: "Back", category: "Compound", equipmentType: "Cable" },
  { name: "Seated Cable Row", muscleGroup: "Back", category: "Compound", equipmentType: "Cable" },
  { name: "Dumbbell Row", muscleGroup: "Back", category: "Compound", equipmentType: "Dumbbell" },
  { name: "T-Bar Row", muscleGroup: "Back", category: "Compound", equipmentType: "Barbell" },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "Shoulders", category: "Compound", equipmentType: "Barbell" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", category: "Compound", equipmentType: "Dumbbell" },
  { name: "Lateral Raise", muscleGroup: "Shoulders", category: "Isolation", equipmentType: "Dumbbell" },
  { name: "Front Raise", muscleGroup: "Shoulders", category: "Isolation", equipmentType: "Dumbbell" },
  { name: "Face Pull", muscleGroup: "Shoulders", category: "Isolation", equipmentType: "Cable" },
  { name: "Reverse Fly", muscleGroup: "Shoulders", category: "Isolation", equipmentType: "Dumbbell" },

  // Legs
  { name: "Squat", muscleGroup: "Legs", category: "Compound", equipmentType: "Barbell" },
  { name: "Front Squat", muscleGroup: "Legs", category: "Compound", equipmentType: "Barbell" },
  { name: "Leg Press", muscleGroup: "Legs", category: "Compound", equipmentType: "Machine" },
  { name: "Romanian Deadlift", muscleGroup: "Legs", category: "Compound", equipmentType: "Barbell" },
  { name: "Leg Curl", muscleGroup: "Legs", category: "Isolation", equipmentType: "Machine" },
  { name: "Leg Extension", muscleGroup: "Legs", category: "Isolation", equipmentType: "Machine" },
  { name: "Bulgarian Split Squat", muscleGroup: "Legs", category: "Compound", equipmentType: "Dumbbell" },
  { name: "Calf Raise", muscleGroup: "Legs", category: "Isolation", equipmentType: "Machine" },
  { name: "Hip Thrust", muscleGroup: "Legs", category: "Compound", equipmentType: "Barbell" },
  { name: "Lunges", muscleGroup: "Legs", category: "Compound", equipmentType: "Dumbbell" },

  // Arms
  { name: "Barbell Curl", muscleGroup: "Arms", category: "Isolation", equipmentType: "Barbell" },
  { name: "Dumbbell Curl", muscleGroup: "Arms", category: "Isolation", equipmentType: "Dumbbell" },
  { name: "Hammer Curl", muscleGroup: "Arms", category: "Isolation", equipmentType: "Dumbbell" },
  { name: "Tricep Pushdown", muscleGroup: "Arms", category: "Isolation", equipmentType: "Cable" },
  { name: "Overhead Tricep Extension", muscleGroup: "Arms", category: "Isolation", equipmentType: "Dumbbell" },
  { name: "Skull Crusher", muscleGroup: "Arms", category: "Isolation", equipmentType: "Barbell" },
  { name: "Dips", muscleGroup: "Arms", category: "Compound", equipmentType: "Bodyweight" },

  // Core
  { name: "Plank", muscleGroup: "Core", category: "Isolation", equipmentType: "Bodyweight" },
  { name: "Hanging Leg Raise", muscleGroup: "Core", category: "Isolation", equipmentType: "Bodyweight" },
  { name: "Cable Crunch", muscleGroup: "Core", category: "Isolation", equipmentType: "Cable" },
  { name: "Ab Wheel Rollout", muscleGroup: "Core", category: "Isolation", equipmentType: "Bodyweight" },
];

async function seed() {
  console.log("Seeding exercises...");

  await db
    .insert(exercises)
    .values(
      globalExercises.map((e) => ({
        userId: null,
        ...e,
      }))
    )
    .onConflictDoNothing();

  console.log(`Seeded ${globalExercises.length} global exercises.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
