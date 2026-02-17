import { currentUser } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getWorkoutsForUserOnDate } from "@/data/workouts";
import { WorkoutDatePicker } from "./WorkoutDatePickerClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await currentUser();
  const { date: dateParam } = await searchParams;

  const today = new Date();
  const dateStr =
    dateParam ??
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const workouts = await getWorkoutsForUserOnDate(user!.username ?? "", date);

  const displayName = user?.fullName ?? user?.username ?? "there";
  const email = user?.primaryEmailAddress?.emailAddress;
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase() || "?";

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user?.imageUrl} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">Welcome back, {displayName}</p>
          {email && <p className="text-sm text-muted-foreground">{email}</p>}
ß        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Workouts</h2>
        <WorkoutDatePicker dateStr={dateStr} />
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
