"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "react-bootstrap";
import { useForm } from "react-hook-form";
import TextField from "../forms/TextField";
import { useTranslations } from "next-intl";
import SubmitButton from "../forms/SubmitButton";
import { z } from "zod";
import { createReportAction } from "@/libs/actions/reportActions";
import { toast } from "sonner";
import { useState } from "react";

const getSchema = (t) => {
  return z.object({
    description: z.string().min(1, t("validations.required")),
  });
};

export default function ReportModal({ id, type, showModal, setShowModal }) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { description: "", comment_type: "", comment_id: "" },
    resolver: zodResolver(getSchema(t)),
    mode: "onChange",
  });
  function handleClose() {
    setShowModal(false);
    reset();
  }

  const onSubmit = async (data) => {
    setLoading(true);
    const reqBody = { comment_type: type, comment_id: id, ...data };
    try {
      const res = await createReportAction(reqBody);

      toast.success(t("successfullyReported"));
      setShowModal(false);
      reset({ description: "", comment_type: "", comment_id: "" });
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} centered>
      <Modal.Header className="pb-0" closeButton>
        <h5>{t(`createReport`)}</h5>
      </Modal.Header>
      <Modal.Body>
        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          <div className="col-12 py-2 px-0">
            <TextField
              placeholder={t("writeHere")}
              name="description"
              id="description"
              {...register("description")}
              error={errors?.description?.message}
            />
          </div>
          <div className="col-12 py-2 px-0">
            <div className="btns">
              <SubmitButton text={t("send")} loading={loading} />
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
