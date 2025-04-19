"use client";
import { useChannel } from "ably/react";
import type { Message as AblyMessage } from "ably";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MessageForm } from "../app/(app)/Schemmas/message";
import axios from "axios";
import MessageBubble from "./MessageBibble";
import { convertToIST } from "@/utils/dateFormater";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ImageIcon, SendIcon } from "lucide-react";

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
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingMessageId, setUploadingMessageId] = useState<string | null>(
    null
  );

  const processedData = data.map((msg) => ({
    ...msg,
    status: msg.status || "sent", // Default to "sent" for existing messages
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
        imageUrl: preview ? preview : undefined,
      };
      setPreview(null);
      setMessages((prevMessages) => [...prevMessages, pendingMessage]);
      const imageUrl = await uploadImageToCloudinary(tempId);
      const response = await axios.post(`/api/send-message?chatId=${chatId}`, {
        ...data,
        imageUrl,
        // Pass the tempId to the server
      });
      setImageFile(null)
      sendChatMessage(response.data.newMessage, tempId);
      console.log(response);
    } catch (error) {
      console.log(error);
      setImageFile(null) 
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
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } else {
      setImageFile(null);
      setPreview(null);
    }
  };

  const uploadImageToCloudinary = async (id: string) => {
    if (!imageFile) {
      return null
    }
    console.log(imageFile)
    setUploadingMessageId(id);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "nextchat");
    const url = `https://api.cloudinary.com/v1_1/do2d2pclb/image/upload`;

    try {
      const response = await axios.post(url, formData);
      const data = response.data;
      return data.secure_url; // Return the URL
    } catch (error) {
      setUploadingMessageId(null);
      console.error("Cloudinary Upload Error (axios):", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (axios.isAxiosError(error) && error.request) {
        console.error("Error request:", error.request);
      } else {
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        } else {
          console.error("Unknown error:", error);
        }
      }
      alert("Failed to upload image. Please try again.");
      return null;
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

    const tempId = message.data.tempId;

    setMessages((prevMessages) => {
      const filteredMessages = prevMessages.filter(
        (msg) =>
          !(msg.tempId && msg.tempId === tempId && msg.status === "pending")
      );
      const history = filteredMessages.slice(-199);
      return [...history, newMessage];
    });
  });

  return (
    <div>
      <div className="flex flex-col mx-4">
        {messages.map((message, index: number) => {
          return (
            <MessageBubble
              key={index}
              isCurrentUser={message.senderId === userId}
              timestamp={convertToIST(message.createdAt)}
              message={message.content}
              avatar="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
              imageUrl={message.imageUrl}
              status={message.status ?? "sent"}
              isUploading={uploadingMessageId === message.tempId}
            />
          );
        })}
        {/* //CHAT BOX */}
        {preview && (
          <img
            alt=""
            className="rounded-lg max-w-full mb-2 object-cover"
            style={{ maxHeight: "200px" }}
            src={preview}
          />
        )}

        <form
          onSubmit={handleSubmit(sendMessage)}
          className="flex gap-2 items-end p-4 border-t bg-background"
        >
          <div className="relative flex-1">
            <p className="text-red-800 text-sm">{errors.content?.message}</p>

            <Textarea
              {...register("content")}
              placeholder="Type a message..."
              className={`resize-none pr-12  ${
                errors.content?.message ? "border border-red-600" : ""
              }`}
              rows={1}
            />

            <label
              htmlFor="image-upload"
              className="absolute right-2 bottom-2 cursor-pointer"
            >
              <label htmlFor="image-upload" className="sr-only">
                Upload an image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                title="Upload an image"
              />
              <ImageIcon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </label>
          </div>
          <Button type="submit" size="icon">
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
