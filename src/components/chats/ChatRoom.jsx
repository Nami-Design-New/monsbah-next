"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import ChatContainer from "./ChatContainer";
import ChatForm from "./ChatForm";
import ChatRoomHeader from "./ChatRoomHeader";

import lottieChat from "@/assets/lotties/chat.json";
import Lottie from "react-lottie";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: lottieChat,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function ChatRoom({ chat, userId }) {
  const { user } = useAuthStore((state) => state);
  const [messages, setMessages] = useState([]);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (+chat?.chat?.is_block === 1) {
      setIsBlocked(true);
    }
    return () => {
      setIsBlocked(false);
    };
  }, [chat]);

  useEffect(() => {
    if (chat?.message) {
      setMessages(chat.message.slice().reverse());
    }
  }, [chat?.message]);

  useEffect(() => {
    if (!chat?.id) return;
    const appKey = process.env.NEXT_PUBLIC_APP_KEY;

    if (!appKey) {
      console.error("Missing NEXT_PUBLIC_APP_KEY in environment variables");
      return;
    }

    const pusher = new Pusher(appKey, {
      cluster: "eu",
    });
    const channel = pusher.subscribe(`chat_${chat.id}`);

    channel.bind("new_message", (data) => {
      pushMessage(data?.message);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [chat?.id]);

  const pushMessage = (message) => {
    if (message?.sender_id === user?.id) return;

    setMessages((prev) => [...prev, message]);
  };

  return (
    <>
      {userId && chat ? (
        <div className="chat_room">
          <ChatRoomHeader
            isBlocked={isBlocked}
            setIsBlocked={setIsBlocked}
            chat={chat?.chat}
          />
          <ChatContainer messages={messages} />
          <ChatForm
            isBlocked={isBlocked}
            setIsBlocked={setIsBlocked}
            chat={chat?.chat}
            setMessages={setMessages}
          />
        </div>
      ) : (
        <div className="lottie_player_holder">
          <Lottie options={defaultOptions} height={250} width={250} />
        </div>
      )}
    </>
  );
}
