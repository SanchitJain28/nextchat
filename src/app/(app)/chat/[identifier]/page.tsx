"use client";

import React from "react";
import { useParams } from "next/navigation";
export default function Chat() {
  const params = useParams<{ identifier: string; }>();

  return (
    <div>
      <p className="text-3xl">Welcome , you are here to chat with {params.identifier}</p>
    </div>
  );
}
