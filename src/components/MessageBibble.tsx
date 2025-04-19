import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { Check, Clock, Loader } from "lucide-react";

interface MessageBubbleProps {
  message: string;
  isCurrentUser: boolean;
  timestamp: string;
  avatar?: string;
  imageUrl?: string;
  status: string;
  isUploading?: boolean;
}
export default function MessageBubble({
  message,
  isCurrentUser,
  timestamp,
  avatar,
  imageUrl,
  status,
  isUploading,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-2 mb-4",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={avatar} />
        <AvatarFallback>{isCurrentUser ? "ME" : "U"}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
            "break-words"
          )}
        >
          {isUploading && <p>Uploading</p>}
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Message attachment"
                className="rounded-lg max-w-full mb-2 object-cover"
                style={{ maxHeight: "200px" }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-lg mr-4">{message} </p>
            {isCurrentUser && status && (
              <p className="text-lg">
                {status === "pending" ? (
                  <Clock />
                ) : status === "error" ? (
                  "error"
                ) : (
                  <Check className="" size={16} color="#32ff24" />
                )}
              </p>
            )}
          </div>
        </div>

        <span className="text-xs text-muted-foreground mt-1">{timestamp}</span>
      </div>
    </div>
  );
}
