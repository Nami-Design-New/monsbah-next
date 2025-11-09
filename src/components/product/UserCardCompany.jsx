"use client";

import { Link } from "@/i18n/navigation";
import { toggleFollowAction } from "@/libs/actions/followActions";
import { useAuthModal } from "@/stores/useAuthModal";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { startTransition, useOptimistic, useState, useRef } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

export default function UserCardCompany({ product }) {
  const { user } = useAuthStore((state) => state);

  const { onOpen } = useAuthModal((state) => state);
  const t = useTranslations();
  const whatsappMessage = `${t("whatsappMessage")} ${product?.name} ${t(
    "onMonsbah"
  )}`;

  const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);

  const initialUser = product?.user || {};
  
  // Use ref to persist error state across re-renders and prevent infinite loops
  const imageErrorRef = useRef(false);
  const [imageError, setImageError] = useState(false);

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
            ? (currentUser[followerKey] || 0) + 1
            : Math.max((currentUser[followerKey] || 0) - 1, 0),
        };
      }
      return currentUser;
    }
  );
  console.log(optimisticUser);
  

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

  // Return null if no user data - check this early
  if (!optimisticUser?.id) {
    return null;
  }

  const profileLink =
    +optimisticUser.id === +user?.id
      ? `/company-profile`
      : `/company-details/${optimisticUser.id}`;

  // Use company default image if no image is provided
  const defaultImage = "/icons/user_default.png";
  
  // Determine which image to display
  const userImage = imageError || !optimisticUser.image 
    ? defaultImage 
    : optimisticUser.image;

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
              src={userImage}
              alt={optimisticUser.name || "user"}
              loading="lazy"
              onError={() => {
                // Prevent infinite loop - only set error state once using ref
                if (!imageErrorRef.current) {
                  imageErrorRef.current = true;
                  setImageError(true);
                }
              }}
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
          <Link aria-label="Profile" href={profileLink}>
            <h3 className="name">{optimisticUser.name || ''}</h3>
          </Link>
          <ul>
            <li>
              <h6>{Number(optimisticUser["ads-count"] || optimisticUser["products_count"] || 0)}</h6>
              <span>{t("posts")}</span>
            </li>
            <li>
              <h6>{Number(optimisticUser["followers-count"] || optimisticUser["followers"] || 0)}</h6>
              <span>{t("followers")}</span>
            </li>
            <li>
              <h6>{Number(optimisticUser["following-count"] || optimisticUser["following"] || 0)}</h6>
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
