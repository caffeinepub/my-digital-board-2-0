import { LockOpen } from "lucide-react";
import React from "react";

interface UnlockModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnlockModal({ isOpen, onConfirm, onCancel }: UnlockModalProps) {
  if (!isOpen) return null;

  return (
    <dialog
      open
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
        zIndex: 9998,
        backdropFilter: "blur(4px)",
        border: "none",
        maxWidth: "100vw",
        maxHeight: "100vh",
        width: "100%",
        height: "100%",
        margin: 0,
      }}
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "18px",
          background: "rgba(18,26,51,0.97)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
          padding: "20px",
          backdropFilter: "blur(12px)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <LockOpen
            size={18}
            style={{ color: "rgba(34,197,94,0.9)", flexShrink: 0 }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            Unlock board?
          </h3>
        </div>
        <p
          style={{
            margin: "0 0 16px 0",
            fontSize: "13px",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.5,
          }}
        >
          This enables editing and moving cards between sections.
        </p>
        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              borderRadius: "10px",
              border: "1px solid rgba(34,197,94,0.4)",
              background: "rgba(34,197,94,0.15)",
              color: "rgba(34,197,94,0.95)",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    </dialog>
  );
}
