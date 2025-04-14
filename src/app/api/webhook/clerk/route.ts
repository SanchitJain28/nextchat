// pages/api/webhooks/clerk.ts
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({
      status: true,
      message: "No headers provided",
    });
  }
  const payload = await req.json();
  const body = JSON.stringify(payload);

  if (!WEBHOOK_SECRET) {
    throw new Error("WEBHOOK_SECRET is not defined");
  }
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    console.log(evt);
    if (evt.type === "user.created") {
    const newUser =  await prisma.user.create({
        data: {
          id: evt.data.id,
          createdAt: new Date(),
          username: evt.data.username,
        },
      });
      console.log("user created" ,newUser)
    }
    if (evt.type === "user.deleted") {
      console.log("user-deleted");
    }
    return NextResponse.json({
      status: true,
    });
  } catch (err) {
    console.error("Clerk Webhook Error:", err);
    return NextResponse.json({
      status: false,
    });
  }
}
