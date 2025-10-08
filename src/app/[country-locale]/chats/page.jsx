import ChatList from "@/components/chats/ChatList";
import ChatRoom from "@/components/chats/ChatRoom";
import { getChat } from "@/hooks/queries/chat/getChat";
import { getChats } from "@/services/chats/getChats";
import { getTranslations } from "next-intl/server";
import { generateHreflangAlternates } from "@/utils/hreflang";

// Mark as dynamic - uses cookies and searchParams
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const t = await getTranslations("meta");

  const { user_id } = searchParams || {};
  const pathname = user_id
    ? `/chats?user_id=${encodeURIComponent(user_id)}`
    : "/chats";
  const alternates = await generateHreflangAlternates(pathname);

  return {
    title: t("chats.defaultTitle"),
    description: t("chats.defaultDescription"),
    alternates,
  };
}

export default async function Page({ searchParams }) {
  const { user_id } = searchParams;

  const [_t, chats, chat] = await Promise.all([
    getTranslations("meta"),
    getChats(),
    user_id ? getChat(user_id) : Promise.resolve(null),
  ]);

  return (
    <section className="chats-section">
      <div className="container h-100 p-0">
        <div className="row m-0 h-100 justify-content-center">
          <ChatList chats={chats} />

          <div className="chat-room-wrapper col-lg-8 col-12 p-2 h-100">
            <ChatRoom chat={chat} userId={user_id} />
          </div>
        </div>
      </div>
    </section>
  );
}
