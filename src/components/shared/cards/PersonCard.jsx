"use client";
import { Link } from "@/i18n/navigation";
import { toggleFollowAction } from "@/libs/actions/followActions";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import { startTransition, useOptimistic } from "react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

export default function PersonCard({ person }) {
  const { user } = useAuthStore((state) => state);
  const t = useTranslations();
  const initialUser = person;

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

  const handleFollow = async () => {
    startTransition(() => {
      setOptimisticUser({ type: "TOGGLE_FOLLOW" });
    });

    try {
      const res = await toggleFollowAction(
        optimisticUser.is_follow,
        optimisticUser.id
      );

      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error?.message);
      toast.error(error?.message || "Failed to update follow status");
    }
  };
  return (
    <div className="PersonCard">
      {" "}
      <Link
        aria-label="Profile"
        href={`${
          +optimisticUser?.id === +user?.id
            ? "/profile"
            : `/user-profile/${optimisticUser?.id}`
        }`}
        className="img_info"
      >
        <div className="img">
          <Image
            width={90}
            height={90}
            src={optimisticUser?.image || optimisticUser?.user_image}
            // onError={(e) => (e.target.src = "/icons/user_default.png")}
            alt="optimisticUser"
          />
        </div>
        <div className="info">
          <h4>{optimisticUser?.name || optimisticUser?.user_name}</h4>
          <p>{optimisticUser?.city?.name || optimisticUser?.user_city?.name}</p>
        </div>
      </Link>{" "}
      {optimisticUser?.is_follow ? (
        <button
          aria-label="Unfollow"
          className="follow_btn"
          onClick={handleFollow}
        >
          <i className="fa-light fa-user-minus"></i>{" "}
          <span>{t("unfollow")}</span>
        </button>
      ) : (
        <button
          aria-label="Follow"
          className="follow_btn"
          onClick={handleFollow}
        >
          <i className="fa-regular fa-user-plus"></i> <span>{t("follow")}</span>
        </button>
      )}
    </div>
  );
}
