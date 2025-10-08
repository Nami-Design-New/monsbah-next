"use client";

import React, { useState, useOptimistic } from "react";
import AddCommentForm from "./AddCommentForm";
import CommentCard from "./CommentCard";
import { toast } from "sonner";
import {
  AddCommentsAction,
  deleteCommentAction,
} from "@/libs/actions/commentsActions";
import { useTranslations } from "use-intl";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatDateToYMDHM } from "@/utils/helpers";
import { useAuthModal } from "@/stores/useAuthModal";

export default function ClientComments({ comments, product }) {
  const t = useTranslations();
  const { user } = useAuthStore((state) => state);

  const [targetComment, setTargetComment] = useState(null);

  const [optimisticComments, updateOptimisticComments] = useOptimistic(
    comments?.data || [],
    (state, action) => {
      switch (action.type) {
        case "add":
          if (action.comment.parent_id) {
            return state.map((comment) =>
              comment.id === action.comment.parent_id
                ? {
                    ...comment,
                    replies: [...(comment.replies || []), action.comment],
                  }
                : comment
            );
          }
          return [action.comment, ...state];

        case "replace":
          return state.map((comment) => {
            if (comment.id === action.tempId) return action.comment;

            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((r) =>
                  r.id === action.tempId ? action.comment : r
                ),
              };
            }

            return comment;
          });

        case "delete":
          if (action.parentId) {
            return state.map((comment) =>
              comment.id === action.parentId
                ? {
                    ...comment,
                    replies: comment.replies?.filter((r) => r.id !== action.id),
                  }
                : comment
            );
          } else {
            return state.filter((comment) => comment.id !== action.id);
          }

        default:
          return state;
      }
    }
  );

  const handleAddComment = async (data) => {
    const tempId = `temp-${Date.now()}`;

    const optimisticComment = {
      id: tempId,
      user_id: user?.id,
      user_name: user?.name,
      user_image: user?.image,
      comment: data.comment,
      date: formatDateToYMDHM(new Date().toLocaleString()),
      replies: [],
      parent_id: data.parent_id || null,
    };

    updateOptimisticComments({ type: "add", comment: optimisticComment });

    // Call server action
    const res = await AddCommentsAction({
      product_id: product.id,
      comment: data.comment,
      parent_id: data.parent_id,
    });

    if (!res?.success) {
      toast.error(res?.message || "Failed to add comment");

      // Remove optimistic comment
      updateOptimisticComments({
        type: "delete",
        id: tempId,
        parentId: data.parent_id || null,
      });
    } else {
      toast.success(res?.data?.message || "Comment added!");

      // Replace optimistic with real comment from server
      updateOptimisticComments({
        type: "replace",
        tempId,
        comment: res.data?.comment || res.data,
      });
    }

    setTargetComment(null);
  };

  const handleDeleteComment = async (id, parentId = null, type) => {
    updateOptimisticComments({ type: "delete", id, parentId });

    const res = await deleteCommentAction({ id, parentId }, type);
    if (!res.success) {
      toast.success(t("deletedSuccessfully"));
    } else {
      toast.error(error?.message || "Failed to delete comment");
    }
  };

  return (
    <>
      <div className="header">
        <h5>
          {t("comments")} <span>( {optimisticComments.length} )</span>
        </h5>
      </div>

      <div className="comments_wrapper">
        {optimisticComments.length === 0 ? (
          <h6 className="noComments">{t("noComments")}</h6>
        ) : (
          optimisticComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              className="fromComments"
              setTargetComment={setTargetComment}
              onDeleteComment={handleDeleteComment}
            />
          ))
        )}
      </div>

      <AddCommentForm
        product={product}
        targetComment={targetComment}
        setTargetComment={setTargetComment}
        onAddComment={handleAddComment}
      />
    </>
  );
}
