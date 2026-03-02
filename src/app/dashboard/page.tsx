import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { WorkoutDatePicker } from "./WorkoutDatePickerClient";
import { AuthButtons } from "./AuthButtonsClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await currentUser();

  if (!user) {
    return (
      <main className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-semibold">You are not signed in</h1>
        <p className="text-muted-foreground">
          Please sign in or create an account to view your dashboard.
        </p>
        <AuthButtons />
      </main>
    );
  }

  const { date: dateParam } = await searchParams;

  const today = new Date();
  const dateStr =
    dateParam ??
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const workouts = await getWorkoutsForUserOnDate(user.id, date);

  const displayName = user.fullName ?? user.username ?? "there";
  const email = user.primaryEmailAddress?.emailAddress;
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase() || "?";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.imageUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">Welcome back, {displayName}</p>
          {email && <p className="text-sm text-muted-foreground">{email}</p>}
ß        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Workouts</h2>
        <div className="flex items-center gap-2">
          <WorkoutDatePicker dateStr={dateStr} />
          <Button asChild size="sm">
            <Link href="/dashboard/workout/new">
              <Plus className="mr-1 h-4 w-4" />
              Log New Workout
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">
            No workouts logged for {format(date, "do MMM yyyy")}.
          </p>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {workout.name ?? "Untitled Workout"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {format(workout.date, "do MMM yyyy")}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
