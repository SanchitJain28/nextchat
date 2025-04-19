import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          status: false,
          message: "User ID is null or not authenticated",
        },
        { status: 401 }
      );
    }
    const chats = await prisma.chat.findMany({
      where: {
        isGroup: false,
        members: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        last_message:true,
        members: {
          select: {
            user: {
              select: { username: true, id: true },
            },
          },
        },
      },
    });
    const filteredChat = chats.map((chat) => {
      const otherMember = chat.members.filter(
        (member) => member.user.id !== userId
      );
      return {
        last_message:chat.last_message,
        chatId: chat.id,
        userId: otherMember[0]?.user.id,
        username: otherMember[0]?.user.username, // optional
      };
    });
    return NextResponse.json(
      {
        status: true,
        message: "Fetching Succesful",
        filteredChat,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        status: false,
        message: "Internal error happenened",
      },
      { status: 500 }
    );
  }
}
