import React from "react";
import "../styles/delete-dialog.css";

export default function DeleteConfirmDialog({
  isOpen,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="delete-dialog-backdrop" onClick={onCancel} />

      {/* Dialog */}
      <div className="delete-dialog">
        {/* Icon */}
        <div className="delete-dialog-icon">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18" />
            <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M5 6l1-1h12l1 1" />
          </svg>
        </div>

        {/* Content */}
        <div className="delete-dialog-content">
          <h2 className="delete-dialog-title">{title}</h2>
          <p className="delete-dialog-message">
            {message}
            {itemName && (
              <>
                <br />
                <span className="delete-dialog-item">{itemName}</span>
              </>
            )}
          </p>
          <p className="delete-dialog-warning">This action cannot be undone.</p>
        </div>

        {/* Actions */}
        <div className="delete-dialog-actions">
          <button
            className="delete-dialog-btn cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="delete-dialog-btn delete"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
