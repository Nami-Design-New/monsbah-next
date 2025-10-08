import { Modal } from "react-bootstrap";

export default function CompanyReviewsModal({
  showModal,
  setShowModal,
  company,
  isMyCompany,
}) {
  return (
    <Modal
      centered
      show={showModal}
      onHide={() => {
        setShowModal(false);
        // setTargetComment(null);
      }}
      className="viewAskModal"
    >
      <Modal.Header className="pb-0" closeButton />
      <Modal.Body></Modal.Body>
    </Modal>
  );
}
