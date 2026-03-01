"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
    <div className="flex justify-center gap-3">
      <SignInButton mode="modal">
        <Button>Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button variant="outline">Sign Up</Button>
      </SignUpButton>
    </div>
  );
}
