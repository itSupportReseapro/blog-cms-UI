import BaseModal from "../BaseModal/BaseModal";
import PdpButton from "@/assets/buttons/button";

export default function ConfirmModal({ title = "Confirm", message, onConfirm, onClose }) {
  return (
    <BaseModal title={title} onClose={onClose}>
      <p className="base-modal__message">{message}</p>
      <div className="base-modal__actions">
        <PdpButton type="button" variant="outline" onClick={onClose}>
          Cancel
        </PdpButton>
        <PdpButton type="button" variant="primary" onClick={onConfirm}>
          Confirm
        </PdpButton>
      </div>
    </BaseModal>
  );
}
