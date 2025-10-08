"use client";

import { toggleFollowAction } from "@/libs/actions/followActions";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";
import React, { startTransition, useOptimistic, useEffect } from "react";
import { toast } from "sonner";

export default function CompanyImageProfile({ client }) {
  const { user } = useAuthStore((state) => state);

  const initialUser = client;

  const [optimisticUser, setOptimisticUser] = useOptimistic(
    initialUser,
    (currentUser, action) => {
      if (action.type === "TOGGLE_FOLLOW") {
        const isFollowing = !currentUser.is_follow;
        const followerKey =
          currentUser.user_type === "user" ? "followers-count" : "followers";

        const updatedUser = {
          ...currentUser,
          is_follow: isFollowing,
          [followerKey]: isFollowing
            ? currentUser[followerKey] + 1
            : currentUser[followerKey] - 1,
        };

        return updatedUser;
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
      }
    } catch (error) {}
  };

  return (
    <div className="img">
      <Image
        width={122}
        height={122}
        src={optimisticUser?.image}
        alt="company"
      />
      {optimisticUser?.id !== user?.client?.id && (
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
      )}
    </div>
  );
}
