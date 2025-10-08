"use client";

import { Link } from "@/i18n/navigation";
import { toggleFollowAction } from "@/libs/actions/followActions";
import { useAuthModal } from "@/stores/useAuthModal";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

export default function UserCard({ product }) {
  const { user } = useAuthStore((state) => state);

  const { userType, onOpen } = useAuthModal((state) => state);
  const t = useTranslations();
  const whatsappMessage = `${t("whatsappMessage")} ${product?.name} ${t(
    "onMonsbah"
  )}`;

  const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);

  const initialUser = product.user;

  const [optimisticUser, setOptimisticUser] = useOptimistic(
    initialUser,
    (currentUser, action) => {
      if (action.type === "TOGGLE_FOLLOW") {
        const isFollowing = !currentUser.is_follow;
        const followerKey =
          currentUser.user_type === "user" ? "followers-count" : "followers";

        return {
          ...currentUser,
          is_follow: isFollowing,
          [followerKey]: isFollowing
            ? currentUser[followerKey] + 1
            : currentUser[followerKey] - 1,
        };
      }
      return currentUser;
    }
  );

  const [imgSrc, setImgSrc] = useState(
    optimisticUser?.image || "/images/icons/user_default.png"
  );

  const handleFollow = async () => {
    startTransition(() => {
      setOptimisticUser({ type: "TOGGLE_FOLLOW" });
    });

    const res = await toggleFollowAction(
      optimisticUser.is_follow,
      optimisticUser.id
    );

    if (!res.success) {
      toast.error(res.message);
    }
  };

  const profileLink =
    +optimisticUser?.id === +user?.id
      ? userType === "client"
        ? "/profile"
        : "/company-profile"
      : `/${userType === "client" ? "user-profile" : "companies"}/${
          optimisticUser?.id
        }`;

  const followerKey =
    optimisticUser.user_type === "user" ? "followers-count" : "followers";
  const postsKey =
    optimisticUser.user_type === "user" ? "ads-count" : "products_count";
  const followingKey =
    optimisticUser.user_type === "user" ? "following-count" : "following";

  return (
    <div className="mulen_user">
      <div className="mulen_user_info">
        <div className="user_wrapper">
          <Link
            aria-label="Profile"
            href={profileLink}
            className="image_wrapper"
          >
            <Image
              width={90}
              height={90}
              src={optimisticUser?.image}
              onError={() => setImgSrc("/images/icons/user_default.png")}
              loading="lazy"
              alt="user"
            />
          </Link>
          {optimisticUser?.id !== user?.id && (
            <>
              {user?.id ? (
                <button
                  aria-label="Toggle following"
                  className="follow_btn"
                  onClick={handleFollow}
                >
                  <i
                    className={`fa-light fa-${
                      optimisticUser?.is_follow ? "check" : "plus"
                    }`}
                  ></i>
                </button>
              ) : (
                <button
                  aria-label="Toggle following"
                  className="follow_btn"
                  onClick={() => onOpen()}
                >
                  <i
                    className={`fa-light fa-${
                      optimisticUser?.is_follow ? "check" : "plus"
                    }`}
                  ></i>
                </button>
              )}
            </>
          )}
        </div>
        <div className="content">
          <Link aria-label="Profile" to={profileLink}>
            <h3 className="name">{optimisticUser?.name}</h3>
          </Link>
          <ul>
            <li>
              <h6>{optimisticUser?.[postsKey]}</h6>
              <span>{t("posts")}</span>
            </li>
            <li>
              <h6>{optimisticUser?.[followerKey]}</h6>
              <span>{t("followers")}</span>
            </li>
            <li>
              <h6>{optimisticUser?.[followingKey]}</h6>
              <span>{t("following")}</span>
            </li>
          </ul>
        </div>
      </div>

      {optimisticUser?.id !== user?.id && (
        <div className="contact">
          {product?.active_call === "active" && (
            <Link
              aria-label="Call"
              target="_blank"
              href={`tel:${product?.phone}`}
              className="call"
            >
              <span>{t("calling")}</span>
            </Link>
          )}

          {product?.active_chat === "active" && (
            <Link
              aria-label="Chat"
              href={`/chats?user_id=${optimisticUser?.id}`}
            >
              <Image width={24} height={32} src="/icons/chat.svg" alt="chat" />
              {product?.active_call === "inactive" && (
                <span>{t("chating")}</span>
              )}
            </Link>
          )}

          {product?.active_whatsapp === "active" && (
            <Link
              aria-label="Whatsapp"
              target="_blank"
              href={`https://wa.me/${optimisticUser?.phone}?text=${encodedWhatsappMessage}`}
            >
              <Image
                width={32}
                height={32}
                src="/icons/whats.svg"
                alt="whatsapp"
              />
              {product?.active_call === "inactive" && (
                <span>{t("whatsapp")}</span>
              )}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
