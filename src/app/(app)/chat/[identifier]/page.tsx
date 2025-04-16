"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageForm } from "../../Schemmas/message";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [chatId, setChatId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ content: string; image?: File }>({
    resolver: zodResolver(MessageForm),
  });

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

  const sendMessage = async (data: { content: string; image?: File }) => {
    try {
      console.log(data);
      setMessages([
        ...messages,
        {
          content: data.content,
          senderId: userId || "unknown", // Fallback to "unknown" if userId is null or undefined
          chatId: chatId,
          id: "as",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // const response = await axios.post(`/api/send-message?chatId=${chatId}`, formData,{
      //   headers:{
      //     "Content-Type":"multipart/form-data"
      //   }
      // });
      // console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } else {
      setImageFile(null);
      setPreview(null);
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
