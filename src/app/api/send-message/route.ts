import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {  auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const {content}=await req.json()
    const params= req.nextUrl.searchParams
    const { userId } = await auth()

    const chatId=params.get("chatId") ?params.get("chatId"):"faa8a802-dbf9-4cfe-b183-b5e1953a3b73"
    if(!chatId){
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
    const newMessage=await prisma.message.create({
        data:{
            content,
            chatId,
            senderId:userId
        }
    })
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
