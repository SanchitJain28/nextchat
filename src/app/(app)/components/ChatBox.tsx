"use client";
import { useChannel } from "ably/react";
import type { Message as AblyMessage } from "ably";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MessageForm } from "../Schemmas/message";
import axios from "axios";
import { Check, Clock } from "lucide-react";
export interface Message {
  chatId: string;
  content: string;
  createdAt: Date;
  id: string;
  imageUrl?: string;
  senderId: string;
  updatedAt: Date;
  videoUrl?: string;
  status?: "pending" | "sent" | "error";
  tempId?: string;
}

export interface fakeMessage {
  chatId: string;
  content: string;
  createdAt: Date;
  imageUrl?: string;
  senderId: string;
  updatedAt: Date;
  videoUrl?: string;
  status?: "pending" | "sent" | "error";
  tempId?: string;
}

export default function ChatBox({
  data,
  chatId,
}: {
  data: Message[];
  chatId: string;
}) {
  const { userId } = useAuth();
  //   const params = useParams<{ identifier: string }>();
  // const [preview, setPreview] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null);

  const processedData = data.map(msg => ({
    ...msg,
    status: msg.status || "sent" // Default to "sent" for existing messages
  }));
  const [messages, setMessages] = useState<Message[] | [] | fakeMessage[]>(
    processedData
  );
  // const [loading, setLoading] = useState<boolean>(false);
  const [lastTempId, setLastTempId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ content: string; image?: File }>({
    resolver: zodResolver(MessageForm),
  });
  const sendChatMessage = (messageText: Message, tempId: string) => {
    channel.publish({ name: "chat-message", data: { ...messageText, tempId } });
  };

  const sendMessage = async (data: { content: string; image?: File }) => {
    try {
      const tempId = `pending-${Date.now()}`;
      setLastTempId(tempId);
      const pendingMessage: fakeMessage = {
        content: data.content,
        senderId: userId || "unknown",
        chatId: chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending",
        tempId: tempId,
      };
      setMessages((prevMessages) => [...prevMessages, pendingMessage]);

      const response = await axios.post(`/api/send-message?chatId=${chatId}`, {
        ...data,
       // Pass the tempId to the server
      });
      sendChatMessage(response.data.newMessage, tempId);
      console.log(response);
    } catch (error) {
      console.log(error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === lastTempId ? { ...msg, status: "error" } : msg
        )
      );
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      // setImageFile(file);
      // const previewUrl = URL.createObjectURL(file);
      // setPreview(previewUrl);
    } else {
      // setImageFile(null);
      // setPreview(null);
    }
  };

  const { channel } = useChannel(`chat-${chatId}`, (message: AblyMessage) => {
    const newMessage: Message = {
      chatId: message.data.chatId,
      content: message.data.content,
      createdAt: new Date(message.data.createdAt),
      id: message.data.id,
      imageUrl: message.data.imageUrl,
      senderId: message.data.senderId,
      updatedAt: new Date(message.data.updatedAt),
      videoUrl: message.data.videoUrl,
      status: "sent",
    };

    // Extract tempId from the message data if it exists
    const tempId = message.data.tempId;

    // When receiving a confirmed message from the server,
    // remove any pending message with the matching tempId
    console.log(newMessage);
    setMessages((prevMessages) => {
      const filteredMessages = prevMessages.filter(
        (msg) =>
          !(msg.tempId && msg.tempId === tempId && msg.status === "pending")
      );

      // Add the confirmed message from the server
      const history = filteredMessages.slice(-199);
      return [...history, newMessage];
    });
  });

  // if (loading) {
  //   return (
  //     <div className="">
  //       <p className="text-5xl">Loading</p>
  //     </div>
  //   );
  // }

  return (
    <div>
      <p className="text-3xl">
        <div className="flex flex-col">
          {messages.map((message, index: number) => {
            return (
              <div
                className={` ${
                  message.senderId === userId
                    ? "bg-red-500 self-end"
                    : "bg-blue-600 self-start"
                } rounded-xl my-1 flex flex-col justify-center`}
                key={index}
              >
                <p key={index} className={`text-3xl font-bold p-2 w-fit mx-4 `}>
                  {message.content}
                </p>
                {message.senderId === userId && message.status && (
                  <span className="text-2xl mx-4 my-2 text-white">
                    {message.status === "pending"
                      ? <Clock />
                      : message.status === "error"
                      ? "Failed to send"
                      :<div className="flex items-center ">
                        <Check className="mr-2" color="#32ff24"/>
                        <p className="text-sm">sent</p>
                      </div>  }
                  </span>
                )}
              </div>
            );
          })}

          <div className="flex border mx-4 rounded-xl px-2 py-4 justify-between">
            <form onSubmit={handleSubmit(sendMessage)}>
              <div className="">
                <label htmlFor="messageInput" className="sr-only">
                  Message
                </label>
                <input
                  {...register("content")}
                  id="messageInput"
                  type="text"
                  className="focus:otline-none active:outline-none"
                  title="Message input"
                />
              </div>

              <div className="">
                <label htmlFor="image"></label>
                <input
                  onChange={handleFileChange}
                  id="image"
                  type="file"
                  className=""
                  title="Image upload"
                />
              </div>

              <p className="text-red-800 text-lg">{errors.content?.message}</p>
              <input type="submit" value="send" />
            </form>
          </div>
        </div>
      </p>
    </div>
  );
}
