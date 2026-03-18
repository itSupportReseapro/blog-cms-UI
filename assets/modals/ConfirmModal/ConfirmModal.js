import BaseModal from "../BaseModal/BaseModal";

export default function ConfirmModal({ title = "Confirm", message, onConfirm, onClose }) {
  return (
    <BaseModal title={title} onClose={onClose}>
      <p>{message}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </BaseModal>
  );
}
