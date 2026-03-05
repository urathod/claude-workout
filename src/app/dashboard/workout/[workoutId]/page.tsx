import { currentUser } from "@clerk/nextjs/server";
import { AuthButtons } from "../../AuthButtonsClient";
import { getAllExercises } from "@/data/exercises";
import { getWorkoutWithExercises } from "@/data/workouts";
import EditWorkoutForm from "./EditWorkoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-semibold">You are not signed in</h1>
        <p className="text-muted-foreground">
          Please sign in or create an account to edit a workout.
        </p>
        <AuthButtons />
      </main>
    );
  }

  const { workoutId } = await params;
  const workout = await getWorkoutWithExercises(user.id, workoutId);

  if (!workout) {
    notFound();
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
        <h1 className="text-2xl font-semibold">Edit Workout</h1>
      </div>

      <EditWorkoutForm workout={workout} exercises={exercises} />
    </main>
  );
}
