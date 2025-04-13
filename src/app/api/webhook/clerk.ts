// pages/api/webhooks/clerk.ts

import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const event = req.body;
    const { type, data: user } = event;

    switch (type) {
      case "user.created":
        await prisma.user.create({
          data: {
            id: user.id,
            username: user.username || user.email_addresses[0]?.email_address,
          },
        });
        break;

      case "user.updated":
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: user.username || user.email_addresses[0]?.email_address,
          },
        });
        break;

      case "user.deleted":
        await prisma.user.delete({
          where: { id: user.id },
        });
        break;

      default:
        // Ignore unhandled events
        break;
    }

    res.status(200).json({ message: `Handled ${type}` });
  } catch (err) {
    console.error("Clerk Webhook Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
