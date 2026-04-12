import "./BaseModal.css";

export default function BaseModal({ title, children, onClose }) {
  return (
    <div className="base-modal-overlay" onClick={onClose}>
      <div
        className="base-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="base-modal__header">
          <h3 className="base-modal__title">{title}</h3>
          <button
            type="button"
            className="base-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            X
          </button>
        </div>
        <div className="base-modal__body">{children}</div>
      </div>
    </div>
  );
}
