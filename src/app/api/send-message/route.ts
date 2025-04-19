import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { content, imageUrl } = await req.json();
  console.log(imageUrl);
  const params = req.nextUrl.searchParams;
  const { userId } = await auth();

  const chatId = params.get("chatId");
  if (!chatId) {
    return NextResponse.json(
      {
        status: false,
        message: "Please provide a chatId",
      },
      { status: 403 }
    );
  }
  if (!userId) {
    return NextResponse.json(
      {
        status: false,
        message: "User ID is null or not authenticated",
      },
      { status: 401 }
    );
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        content,
        chatId,
        senderId: userId,
        imageUrl,
      },
    });

    let lastMessageText = "";
    if (content) lastMessageText = content;
    else if (imageUrl) lastMessageText = "📷 Image";
    else lastMessageText = "New message";

    // Update the chat's last_message field
    await prisma.chat.update({
      where: { id: chatId },
      data:{
        last_message:lastMessageText
      },
    });
    return NextResponse.json(
      {
        status: true,
        message: "message sent",
        newMessage,
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
