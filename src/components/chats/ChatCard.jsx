"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form } from "react-bootstrap";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ChatCard({
  chat,
  checkedState,
  selectedChats,
  setSelectedChats,
  setShowChats,
}) {
  const t = useTranslations();
  const [lastMessage, setLastMessage] = useState();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    switch (chat?.lastMessageType) {
      case "contact":
        setLastMessage(t("chat.contact"));
        break;
      case "voice":
        setLastMessage(t("chat.voice"));
        break;
      case "image":
        setLastMessage(t("chat.image"));
        break;
      case "video":
        setLastMessage(t("chat.video"));
        break;
      case "location":
        setLastMessage(t("chat.location"));
        break;
      default:
        setLastMessage(chat?.lastMessage);
    }
  }, [chat, t]);

  const handleOpenChat = () => {
    if (!checkedState) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("user_id", chat?.user_id);
      router.push(`?${params.toString()}`);
      setShowChats(false);
    }
  };

  return (
    <div className="chat_card" onClick={handleOpenChat}>
      {checkedState && (
        <Form.Check
          className="select-chat"
          type="checkbox"
          checked={selectedChats.includes(chat?.id)}
          onChange={() =>
            setSelectedChats(
              selectedChats.includes(chat?.id)
                ? selectedChats.filter((id) => id !== chat?.id)
                : [...selectedChats, chat?.id]
            )
          }
        />
      )}
      <div className="img">
        <Image
          width={64}
          height={64}
          src={chat?.user_image}
          loading="lazy"
          alt={chat?.user_name}
        />
        <span className={chat?.is_active === 0 ? "status" : "status online"} />
      </div>
      <span className="name_span">{chat?.user_name}</span>
      <div className="content">
        <h6>{chat?.user_name}</h6>
        <p>{lastMessage}</p>
        <span className={chat?.is_active === 0 ? "" : "online"}>
          {chat?.is_active === 0 ? t("chat.offline") : t("chat.online")}
        </span>
      </div>
    </div>
  );
}
