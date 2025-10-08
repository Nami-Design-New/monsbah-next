"use client";

import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import NotificationCard from "./NotificationCard";
import { Link } from "@/i18n/navigation";
import useGetNotifications from "@/hooks/queries/notifications/useGetNotifications";
import { useTranslations } from "use-intl";
import Image from "next/image";
import { useAuthModal } from "@/stores/useAuthModal";

const NotificationsDropDown = () => {
  const t = useTranslations();
  const { userType } = useAuthModal((state) => state);

  const [unreadNotificationsLength, setUnreadNotificationsLength] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);

  const { data: notifications, isLoading: notififcationsLoading } =
    useGetNotifications();

  const allNotifications =
    notifications?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useEffect(() => {
    if (allNotifications && !notififcationsLoading) {
      const unreadNotifications = allNotifications?.filter(
        (notification) => +notification.is_read === 0
      );
      setUnreadNotificationsLength(unreadNotifications.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notififcationsLoading]);

  return (
    <Dropdown
      show={showNotificationDropdown}
      onToggle={() => {
        setShowNotificationDropdown(!showNotificationDropdown);
        setUnreadNotificationsLength(0);
      }}
    >
      <Dropdown.Toggle
        aria-label="Notifications"
        id="dropdown-basic"
        className="link"
      >
        <Image width={16} height={16} src="/icons/bell.svg" alt="" />
        {unreadNotificationsLength ? (
          <span className="count">
            {unreadNotificationsLength < 100
              ? unreadNotificationsLength
              : "99+"}{" "}
          </span>
        ) : null}
      </Dropdown.Toggle>
      <Dropdown.Menu className="drop_Message_Menu">
        {allNotifications && (
          <div className="scroll_menu">
            {allNotifications?.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onClick={() => setShowNotificationDropdown(false)}
              />
            ))}
          </div>
        )}
        <Link
          aria-label="Show All"
          className="showall"
          href={
            userType === "client"
              ? "/profile/notifications"
              : "/company-notification"
          }
          style={{ textDecoration: "none" }}
          onClick={() => setShowNotificationDropdown(false)}
        >
          {t("viewAllNotifications")}
        </Link>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationsDropDown;
