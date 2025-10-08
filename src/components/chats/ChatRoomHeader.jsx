"use client";
import { Link } from "@/i18n/navigation";
import { blockChatAction, deleteChatAction } from "@/libs/actions/chatActions";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Dropdown } from "react-bootstrap";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import ConfirmationModal from "../shared/modals/ConfirmationModal";
import ReportChatModal from "./ReportChatModal";

function ChatRoomHeader({ chat, isBlocked, setIsBlocked }) {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteChatAction(chat?.id);
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        setShowModal(false);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    setBlockLoading(true);
    try {
      const res = await blockChatAction(chat?.id);
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        setShowBlockModal(false);
        setIsBlocked(true);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setBlockLoading(false);
    }
  };

  return (
    <div className="chat_header">
      <div className="user">
        <Link
          aria-label="Profile"
          href={`/profile/${chat?.user_id}`}
          className="img"
        >
          <img
            src={chat?.user_image}
            alt="avatar"
            loading="lazy"
            onError={(e) => (e.target.src = "/images/icons/user_default.png")}
          />
        </Link>
        <Link
          aria-label="Profile"
          href={`/profile/${chat?.user_id}`}
          className="content"
        >
          <h6>{chat?.user_name}</h6>
          <span className={chat?.is_active ? "online" : "offline"}>
            {chat?.is_active ? t("chat.online") : t("chat.offline")}
          </span>
        </Link>
      </div>

      <Dropdown>
        <Dropdown.Toggle aria-label="Chat Actions">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <div className="actions_menu">
            <button
              onClick={() => setShowModal(true)}
              aria-label={t("chat.delete")}
            >
              <i className="fa-regular fa-trash"></i> {t("chat.deleteChat")}
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              aria-label={t("chat.report")}
            >
              <i className="fa-regular fa-flag"></i> {t("chat.report")}
            </button>
            {!isBlocked && (
              <button
                onClick={() => setShowBlockModal(true)}
                aria-label={t("chat.block")}
              >
                <i className="fa-regular fa-ban"></i> {t("chat.block")}
              </button>
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>

      {/* Modals */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        eventFun={handleDelete}
        loading={loading}
        type="delete"
        buttonText={t("chat.delete")}
        text={t("chat.areYouSureYouWantDeleteThisChat")}
      />

      <ConfirmationModal
        showModal={showBlockModal}
        setShowModal={setShowBlockModal}
        eventFun={handleBlock}
        loading={blockLoading}
        type="delete"
        buttonText={t("chat.block")}
        text={`${t("chat.areYouSureYouWantblockThisChat")} ${chat?.user_name}`}
      />

      <ReportChatModal
        id={chat?.id}
        showModal={showReportModal}
        setShowModal={setShowReportModal}
      />
    </div>
  );
}

export default ChatRoomHeader;
