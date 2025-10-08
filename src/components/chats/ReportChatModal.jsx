"use client";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "sonner";
import TextField from "../shared/forms/TextField";
import SubmitButton from "../shared/forms/SubmitButton";

export default function ReportChatModal({ id, showModal, setShowModal }) {
  const t = useTranslations();
  const handleChange = (e, setFormData) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const [formData, setFormData] = useState({
    description: "",
    chat_id: "",
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setFormData({
      ...formData,
      chat_id: +id || "",
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/client/report`, formData);
      if (res.status === 201 || res.status === 200) {
        toast.success(t("successfullyReported"));
        setShowModal(false);
        setFormData({
          description: "",
          chat_id: "",
        });
      } else {
        toast.error(t("someThingWentWrong"));
        throw new Error();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || t("someThingWentWrong"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header className="pb-0" closeButton>
        <h5>{t(`createReport`)}</h5>
      </Modal.Header>{" "}
      <Modal.Body>
        <form onSubmit={handleSubmit} className="form">
          <div className="col-12 pb-2 px-0">
            {" "}
            <TextField
              required
              placeholder={t("writeHere")}
              name="description"
              id="description"
              value={formData?.description}
              onChange={(e) => {
                handleChange(e, setFormData);
              }}
            />
          </div>
          <div className="col-12 pb-2 px-0">
            {" "}
            <div className="btns">
              <SubmitButton text={t("send")} loading={loading} />
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
