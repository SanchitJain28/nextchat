"use client";
import Ably from "ably";
import { AblyProvider, ChannelProvider } from "ably/react";
import ChatBox, { Message } from "../../components/ChatBox";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function Chat() {
  const params = useParams<{ identifier: string }>();

  const client = new Ably.Realtime({ authUrl: `/api` });
  const [chatId, setChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getOrCreateChat = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/find-create-chat?identifier=${params.identifier}`
      );
      const {
        data: { chat },
      } = response;
      setMessages(chat.messages?chat.messages:[]);
      setChatId(chat.id);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
    <AblyProvider client={client}>
      <ChannelProvider channelName={`chat-${chatId}`}>
        <ChatBox chatId={chatId} data={messages} />
      </ChannelProvider>
    </AblyProvider>
  );
}
