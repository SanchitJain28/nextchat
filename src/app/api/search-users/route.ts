import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      {
        status: false,
        message: "Please provide the query parameter",
      },
      { status: 403 }
    );
  }
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: q,
          mode: "insensitive",
        },
      },
      select: { username: true },
    });
    return NextResponse.json(
      {
        status: true,
        users,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal servor occured",
      },
      { status: 500 }
    );
  }
}
