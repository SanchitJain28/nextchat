"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { SendHorizontal } from "lucide-react";

interface Message {
  chatId: string;
  content: string;
  createdAt: Date;
  id: string;
  imageUrl?: string;
  senderId: string;
  updatedAt: Date;
  videoUrl?: string;
}

export default function Chat() {
  const { userId } = useAuth();
  const params = useParams<{ identifier: string }>();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [chatId, setChatId] = useState<string>("");
  const getOrCreateChat = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/find-create-chat?identifier=${params.identifier}`
      );
      const {
        data: { chat },
      } = response;
      setMessages(chat.messages);
      setChatId(chat.id);
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    try {
      const response = await axios.post(`/api/send-message?chatId=${chatId}`, {
        content,
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getOrCreateChat();
  }, []);

  if (loading) {
    return (
      <div className="">
        <p className="text-5xl">Loading</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-3xl">
        <div className="flex flex-col">
          {messages.map((message, index: number) => {
            return (
              <p
                key={index}
                className={`text-3xl font-bold p-2 w-fit mx-4 rounded-xl my-2  ${
                  message.senderId === userId
                    ? "bg-red-500 self-end"
                    : "bg-blue-600 self-start"
                }`}
              >
                {message.content}
              </p>
            );
          })}
          <label htmlFor="messageInput" className="sr-only">
            Message
          </label>
          <div className="flex border mx-4 rounded-xl px-2 py-4 justify-between">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              id="messageInput"
              type="text"
              className="focus:otline-none active:outline-none"
              title="Message input"
            />
            <button onClick={sendMessage}><SendHorizontal size={34}/>{""}</button>
          </div>
        </div>
      </p>
    </div>
  );
}
