"use client";
import Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import ChatBox, { Message } from "../../../../components/ChatBox";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loading from "@/components/loading";

export default function Chat() {
  const params = useParams<{ identifier: string }>();

  const client = new Ably.Realtime({ authUrl: `/api` });
  const [chatId, setChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const getOrCreateChat = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/find-create-chat?identifier=${params.identifier}`
      );
      console.log(response.data);
      const {
        data: { chat },
      } = response;
      setMessages(chat.messages ? chat.messages : []);
      setChatId(chat.id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // You can access error.response, error.message etc.
        console.error("Axios error:", error);
        setError(error.response?.data.message);
      } else {
        // Some other type of error
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getOrCreateChat();
  }, []);

  if (error) {
    return (
      <div className="">
        <p className="text-5xl">{error}</p>
      </div>
    );
  }
  if (loading) {
    return (
      <Loading/>
    );
  }
  return (
    <AblyProvider client={client}>
      <ChannelProvider channelName={`chat-${chatId}`}>
        <ChatBox chatId={chatId} data={messages} />
      </ChannelProvider>
    </AblyProvider>
  );
}
