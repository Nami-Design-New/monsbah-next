"use client";

import { useAuthModal } from "@/stores/useAuthModal";
import { useAuthStore } from "@/stores/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../shared/forms/InputField";
import SubmitButton from "../shared/forms/SubmitButton";

const getSchema = (t) =>
  z.object({
    comment: z.string().min(1, t("validations.required")),
  });

export default function AddCommentForm({
  product,
  targetComment,
  setTargetComment,
  onAddComment,
}) {
  const t = useTranslations();
  const { onOpen } = useAuthModal((state) => state);
  const { user } = useAuthStore((state) => state);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getSchema(t)),
  });

  const onSubmit = async (data) => {
    const payload = {
      comment: data.comment,
      parent_id: targetComment?.id || null,
    };
    reset();

    await onAddComment(payload);
  };

  return (
    <div>
      {targetComment && (
        <span className="replyTo">
          <button aria-label="Reply to" onClick={() => setTargetComment(null)}>
            <i className="fas fa-times"></i>
          </button>
          {t("replyTo")} <b>{targetComment?.user_name}</b>:{" "}
          {targetComment?.comment}
        </span>
      )}
      <form className="form addCommentForm" onSubmit={handleSubmit(onSubmit)}>
        <InputField placeholder={t("addComment")} {...register("comment")} />
        {user?.id ? (
          <SubmitButton text={t("send")} />
        ) : (
          <button onClick={() => onOpen()}>{t("send")}</button>
        )}
      </form>
      {errors?.comment && (
        <p className="text-danger mt-2 text-end">
          {" "}
          {errors?.comment?.message}{" "}
        </p>
      )}
    </div>
  );
}
