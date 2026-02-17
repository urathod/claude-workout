"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function WorkoutDatePicker({ dateStr }: { dateStr: string }) {
  const router = useRouter();

  // Parse as local midnight to avoid timezone-driven date shifts
  const [year, month, day] = dateStr.split("-").map(Number);
  const selected = new Date(year, month - 1, day);

  function handleSelect(d: Date | undefined) {
    if (!d) return;
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    router.push(`/dashboard?date=${next}`);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-48 justify-start gap-2">
          <CalendarIcon className="h-4 w-4 shrink-0" />
          {format(selected, "do MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
