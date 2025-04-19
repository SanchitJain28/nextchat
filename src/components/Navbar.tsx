"use client";
import React from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useParams } from "next/navigation";
export default function Navbar() {
  const params = useParams<{ identifier: string }>();
  return (
    <div className="flex items-center justify-between border-b mb-8">
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      {params.identifier && (
        <div className="mx-4">
          <p className="text-xl font-semibold">Chat with {params.identifier}</p>
        </div>
      )}
    </div>
  );
}
