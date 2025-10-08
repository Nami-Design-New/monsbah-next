import { useTranslations } from "next-intl";
import { Modal } from "react-bootstrap";

const ConfirmationModal = ({
  showModal,
  setShowModal,
  text,
  target,
  buttonText,
  eventFun,
  loading,
  type = "delete",
}) => {
  const t = useTranslations();

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header className="pb-0" closeButton />
      <Modal.Body
        className={`confirm-delete ${
          type === "delete" || type === "logout" ? "" : "other"
        }`}
      >
        <p>
          {text} <span>{target}</span>
        </p>
        <div className="d-flex justify-content-end gap-3">
          <button
            aria-label="Cancel"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(false);
            }}
            className="cancel-btn"
          >
            {t("cancel")}
          </button>
          <button
            className="log delete-btn"
            onClick={eventFun}
            disabled={loading}
          >
            {buttonText}
            <i className={loading ? "fa-solid fa-spinner fa-spin" : ""} />
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmationModal;
