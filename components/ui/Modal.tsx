"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ open, onClose, title, children, maxWidth = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = title ? "modal-title" : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      aria-modal="true"
      className={[
        "w-full rounded-sm p-0",
        "bg-[var(--black-card)] border border-[var(--black-border)]",
        "text-[var(--white)]",
        "backdrop:bg-black/70",
        maxWidthClasses[maxWidth],
      ].join(" ")}
      onClose={onClose}
    >
      <div className="flex flex-col">
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--black-border)]">
            <h2 id="modal-title" className="text-base font-semibold text-[var(--white)]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[var(--white-dim)] hover:text-[var(--white)] transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </dialog>
  );
}
