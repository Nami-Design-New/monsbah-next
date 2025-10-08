"use client";

import { useState } from "react";
import SidebarChats from "./SidebarChats";

export default function ChatList({ chats }) {
  //   const { data: chats, isLoading } = useGetChats();
  const [showChats, setShowChats] = useState(false);
  return (
    <>
      {chats?.length > 0 && (
        <>
          <div
            className={`chatssidebar col-lg-4 col-12 p-2 h-100 sidebar_col ${
              showChats ? "active" : ""
            }`}
          >
            <SidebarChats chats={chats} />
          </div>
        </>
      )}
    </>
  );
}
