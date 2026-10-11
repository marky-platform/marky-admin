import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import CancelButton from "./CancelButton";
import CheckboxWithLabel from "./CheckboxWithLabel";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  content: string | React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  /** Illustration shown above the title — switches the dialog to the compact,
   * header-less "warning" layout (image, centered title/subtitle, optional
   * confirmation checkbox, full-width footer buttons). */
  image?: string;
  /** Optional element layered on top of `image` (e.g. a small warning icon),
   * for illustrations that need a badge/overlay rather than a plain photo. */
  imageOverlay?: React.ReactNode;
  /** When set, renders a confirmation checkbox with this label and keeps the
   * confirm button disabled until it's checked. Resets when the dialog closes. */
  confirmationCheckboxLabel?: string;
  confirmColor?: "primary" | "error";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  content,
  onClose,
  onConfirm,
  cancelText = "Cancelar",
  confirmText = "Aceptar",
  isLoading = false,
  image,
  imageOverlay,
  confirmationCheckboxLabel,
  confirmColor = "primary",
}) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!open) setChecked(false);
  }, [open]);

  const confirmDisabled =
    isLoading || (Boolean(confirmationCheckboxLabel) && !checked);

  return (
    <Dialog
      open={open}
      onClose={(_ev, reason) => {
        // prevent closing while an action is in progress
        if (!isLoading) onClose();
      }}
      disableEscapeKeyDown={isLoading}
    >
      {image ? (
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3.25,
            pt: 5.5,
            pb: 6,
            px: 5.5,
          }}
        >
          <Box sx={{ position: "relative", width: 215, height: 197 }}>
            <Box
              component="img"
              src={image}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {imageOverlay && (
              <Box
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                }}
              >
                {imageOverlay}
              </Box>
            )}
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: "text.heading" }}>
              {title}
            </Typography>
            {typeof content === "string" ? (
              <Typography sx={{ fontSize: 14, color: "text.muted", mt: 0.5 }}>
                {content}
              </Typography>
            ) : (
              content
            )}
          </Box>
          {confirmationCheckboxLabel && (
            <CheckboxWithLabel
              label={
                <Typography sx={{ fontSize: 14, color: "text.soft" }}>
                  {confirmationCheckboxLabel}
                </Typography>
              }
              checked={checked}
              disabled={isLoading}
              onChange={(e) => setChecked(e.target.checked)}
            />
          )}
        </DialogContent>
      ) : (
        <>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            {typeof content === "string" ? (
              <Typography>{content}</Typography>
            ) : (
              content
            )}
            {confirmationCheckboxLabel && (
              <CheckboxWithLabel
                label={confirmationCheckboxLabel}
                checked={checked}
                disabled={isLoading}
                onChange={(e) => setChecked(e.target.checked)}
              />
            )}
          </DialogContent>
        </>
      )}
      <DialogActions
        sx={
          image
            ? {
                display: "flex",
                gap: 1.5,
                boxShadow: (theme) => `0px -1px 0px ${theme.palette.border.layout}`,
                px: 2.5,
                py: 1.5,
              }
            : { display: "flex", gap: 2 }
        }
      >
        <CancelButton
          onClick={onClose}
          disabled={isLoading}
          sx={
            image
              ? { flex: 1, backgroundColor: "grey.400", color: "text.title", paddingY: 2 }
              : { paddingX: 2, paddingY: 2 }
          }
        >
          {cancelText}
        </CancelButton>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={confirmDisabled}
          sx={{
            boxShadow: 0,
            ...(image ? { flex: 1, paddingY: 2 } : { paddingX: 2, paddingY: 2 }),
            ...(confirmColor === "error" && {
              "&.Mui-disabled": {
                backgroundColor: "error.light",
                color: "fixed.white",
              },
            }),
          }}
        >
          {isLoading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            confirmText
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
