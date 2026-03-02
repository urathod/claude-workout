import { currentUser } from "@clerk/nextjs/server";
import { AuthButtons } from "../../AuthButtonsClient";
import { getAllExercises } from "@/data/exercises";
import NewWorkoutForm from "./NewWorkoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewWorkoutPage() {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-semibold">You are not signed in</h1>
        <p className="text-muted-foreground">
          Please sign in or create an account to create a workout.
        </p>
        <AuthButtons />
      </main>
    );
  }

  const exercises = await getAllExercises();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">New Workout</h1>
      </div>

      <NewWorkoutForm exercises={exercises} />
    </main>
  );
}
