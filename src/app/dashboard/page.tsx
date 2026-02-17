"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MOCK_WORKOUTS = [
  { id: 1, name: "Back Squat", sets: 4, reps: 5, weight: 100 },
  { id: 2, name: "Bench Press", sets: 3, reps: 8, weight: 80 },
  { id: 3, name: "Deadlift", sets: 3, reps: 5, weight: 140 },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Workouts</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-start gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {format(date, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-3">
        {MOCK_WORKOUTS.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">
            No workouts logged for {format(date, "do MMM yyyy")}.
          </p>
        ) : (
          MOCK_WORKOUTS.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{workout.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {workout.sets} sets &times; {workout.reps} reps &mdash;{" "}
                  {workout.weight} kg
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
