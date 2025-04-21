"use client";
import Loading from "@/components/loading";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchBox } from "@/components/searchBox";
interface chat {
  chatId: string;
  userId: string;
  username: string;
  last_message?: string;
}

export default function Chats() {
  const [chats, setChats] = useState<chat[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/fetchChatsByUser");
      setChats(response.data.filteredChat);
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchChats();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex flex-col h-screen max-w-3xl mx-auto bg-background">
        <SearchBox />

        <ScrollArea>
          {chats.map((chat) => {
            return (
              <Link
                key={chat.chatId}
                href={`/chat/${chat.username}`}
                className="block"
              >
                {" "}
                <div
                  key={chat.chatId}
                  className="flex items-center border-b gap-4 p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors mb-2"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                      }
                    />
                    <AvatarFallback>
                      {chat.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium truncate">{chat.username}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message
                          ? chat.last_message
                          : "Start conversation"}
                      </p>
                      {false && (
                        <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </ScrollArea>
      </div>
    </div>
  );
}
