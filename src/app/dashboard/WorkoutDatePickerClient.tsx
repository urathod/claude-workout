"use client";

import dynamic from "next/dynamic";

export const WorkoutDatePicker = dynamic(
  () => import("./WorkoutDatePicker").then((m) => m.WorkoutDatePicker),
  { ssr: false }
);
