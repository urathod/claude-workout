"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createWorkout } from "./actions";
import type { Exercise } from "@/db/schema";

type SetEntry = {
  reps: string;
  weightLbs: string;
  rpe: string;
};

type ExerciseEntry = {
  exerciseId: string;
  sets: SetEntry[];
};

export default function NewWorkoutForm({
  exercises,
}: {
  exercises: Exercise[];
}) {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("");
  const [notes, setNotes] = useState("");
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function addExercise() {
    setExerciseEntries((prev) => [
      ...prev,
      { exerciseId: "", sets: [{ reps: "", weightLbs: "", rpe: "" }] },
    ]);
  }

  function removeExercise(index: number) {
    setExerciseEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExerciseId(index: number, exerciseId: string) {
    setExerciseEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, exerciseId } : e))
    );
  }

  function addSet(exerciseIndex: number) {
    setExerciseEntries((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: [...e.sets, { reps: "", weightLbs: "", rpe: "" }] }
          : e
      )
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExerciseEntries((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? { ...e, sets: e.sets.filter((_, si) => si !== setIndex) }
          : e
      )
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: keyof SetEntry,
    value: string
  ) {
    setExerciseEntries((prev) =>
      prev.map((e, i) =>
        i === exerciseIndex
          ? {
              ...e,
              sets: e.sets.map((s, si) =>
                si === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : e
      )
    );
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const result = await createWorkout({
        name: name || undefined,
        date,
        notes: notes || undefined,
        startTime: startTime || undefined,
        exercises: exerciseEntries
          .filter((e) => e.exerciseId)
          .map((e, i) => ({
            exerciseId: e.exerciseId,
            orderIndex: i,
            sets: e.sets.map((s, si) => ({
              setNumber: si + 1,
              reps: s.reps ? parseInt(s.reps, 10) : undefined,
              weightLbs: s.weightLbs || undefined,
              rpe: s.rpe || undefined,
            })),
          })),
      });
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Workout Name</Label>
          <Input
            id="name"
            placeholder="e.g. Upper Body Push"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "do MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about this workout..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exercises</h3>
          <Button type="button" variant="outline" size="sm" onClick={addExercise}>
            <Plus className="mr-1 h-4 w-4" />
            Add Exercise
          </Button>
        </div>

        {exerciseEntries.map((entry, exIdx) => (
          <Card key={exIdx}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Exercise {exIdx + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(exIdx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={entry.exerciseId}
                onValueChange={(v) => updateExerciseId(exIdx, v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name}
                      {ex.muscleGroup ? ` (${ex.muscleGroup})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-sm font-medium text-muted-foreground">
                  <span>Reps</span>
                  <span>Weight (lbs)</span>
                  <span>RPE</span>
                  <span></span>
                </div>
                {entry.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                  >
                    <Input
                      type="number"
                      min="0"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(exIdx, setIdx, "reps", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="lbs"
                      value={set.weightLbs}
                      onChange={(e) =>
                        updateSet(exIdx, setIdx, "weightLbs", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      placeholder="RPE"
                      value={set.rpe}
                      onChange={(e) =>
                        updateSet(exIdx, setIdx, "rpe", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSet(exIdx, setIdx)}
                      disabled={entry.sets.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exIdx)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {exerciseEntries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No exercises added yet. Click &quot;Add Exercise&quot; to get started.
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Create Workout"}
      </Button>
    </form>
  );
}
