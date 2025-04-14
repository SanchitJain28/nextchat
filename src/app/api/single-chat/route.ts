import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  // const { userId } = await auth();
  // if (!userId) {
  //   return NextResponse.json(
  //     {
  //       status: false,
  //       message: "Not authenticated",
  //     },
  //     { status: 401 }
  //   );
  // }
  const testUserID = "user_2virDZHPMaoKhMLoZcYPFUFX2vb";
  try {
    //search user in database
    const user = await prisma.user.findFirst({
      where: {
        username: params.get("identifier"),
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          status: false,
          message: "User not found on our app",
        },
        { status: 401 }
      );
    }

    //if user exists

    //check if coversation exists
    const chatExists = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: { in: [user.id, testUserID] },
          },
        },
      },
    });
    if (chatExists) {
      return NextResponse.json(
        {
          status: true,
          message: "chat exists",
        },
        { status: 201 }
      );
    }

    //create a new chat with chat members
     await prisma.chat.create({
      data: {
        isGroup: false,
        members: {
          create: [
            {
              // Link to the first user
              // 'userId' is the field in the ChatMember model
              userId: user.id,
              // Prisma automatically handles linking the 'chatId'
              // 'joinedAt' will use the default value
            },
            {
              // Link to the second user
              userId: testUserID,
              // Prisma automatically handles linking the 'chatId'
              // 'joinedAt' will use the default value
            },
          ],
        },
      },
    });
    
    return NextResponse.json(
      {
        status: true,
        message: "chat created",
      },
      { status: 201 }
    );
    return;
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
