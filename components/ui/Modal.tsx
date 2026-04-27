"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  "aria-label"?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, "aria-label": ariaLabel, children, maxWidth = "md" }: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby={title ? "modal-title" : undefined}
      aria-modal="true"
      slotProps={{
        paper: !title && ariaLabel ? { "aria-label": ariaLabel } : undefined,
      }}
    >
      {title && (
        <DialogTitle id="modal-title" sx={{ pr: 6 }}>
          {title}
          <IconButton
            aria-label="Close"
            onClick={onClose}
            size="small"
            sx={{
              position: "absolute",
              right: 16,
              top: 12,
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <Box component="span" sx={{ fontSize: "1.25rem", lineHeight: 1 }}>
              ×
            </Box>
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
