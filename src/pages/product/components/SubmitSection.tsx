import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import React from "react";
import Link from "../../../components/Link";

interface SubmitSectionProps {
  // Validates every section and, if everything's complete, submits the
  // form; otherwise blocks submission and points the user at the first
  // incomplete section. Replaces native `type="submit"` so the page can run
  // its own cross-section validation before Formik's submit flow fires.
  onPublish: () => void;
  // Leaves the form (same dirty-check/exit-confirmation flow as the
  // header's back button) — Figma's footer always shows a "Cancelar"
  // button alongside "Publicar".
  onCancel?: () => void;
  // True while the create/update mutation is in flight. Disables the
  // "Publicar" button so impatient repeated clicks while waiting for the
  // response don't fire multiple submissions and create duplicate products.
  isSubmitting?: boolean;
  // 0-100 while the request body (which may include a product video) is
  // being sent; null once nothing is uploading. Once it hits 100 the browser
  // is still waiting on the server, so the label falls back to "Publicando...".
  uploadProgress?: number | null;
  // True when the form has no pending changes relative to the last loaded/
  // saved state (Formik's `dirty`). Only meaningful in edit mode — a brand
  // new product has nothing to compare against yet.
  isDirty?: boolean;
  // True when editing an existing product (id present), false when creating
  // a new one. Gates whether the disabled/"Publicado" state applies at all.
  isEditMode?: boolean;
  // Switches to the Figma "Mobile 430px" footer: full-width 42px button,
  // no legal disclaimer (Figma's mobile frame omits it entirely — there's
  // no room), grey.600 border/disabled fill instead of the desktop layout.
  isMobile?: boolean;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  onPublish,
  onCancel,
  isSubmitting = false,
  uploadProgress = null,
  isDirty = true,
  isEditMode = false,
  isMobile = false,
}) => {
  const isUploading =
    isSubmitting && uploadProgress !== null && uploadProgress < 100;

  return (
    <Box
      sx={{
        p: isMobile ? 3 : 2,
        pt: isMobile ? 3 : 4,
        borderTop: "1px solid",
        // grey.100 resolves to white, which made this border invisible;
        // Figma's footer divider is grey.600 (#E6E6E6) on both breakpoints.
        borderColor: "grey.600",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "surface.base",
        width: "100%",
      }}
    >
      {!isMobile && (
        <Box display={"flex"} justifyContent={"center"} width={"100%"}>
          <Typography variant="body2" color="textSecondary">
            Al hacer click en "Publicar", aceptas los {/* @ts-ignore */}
            <Link target={"_blank"}>Términos y Condiciones</Link> de
            visualización de productos en Marky.
          </Typography>
        </Box>
      )}
      <Box sx={{ minWidth: isMobile ? "100%" : 160 }}>
        {isUploading && (
          <LinearProgress
            variant="determinate"
            value={uploadProgress ?? 0}
            sx={{ mb: 0.5 }}
          />
        )}
        <Button
          type="button"
          variant="contained"
          onClick={onPublish}
          fullWidth={isMobile}
          sx={
            isMobile
              ? {
                  height: 42,
                  borderRadius: "6px",
                  fontSize: 15,
                  fontWeight: 500,
                  letterSpacing: "-0.1px",
                  "&.Mui-disabled": {
                    backgroundColor: "grey.600",
                    color: "fixed.white",
                  },
                }
              : { px: 3 }
          }
          disabled={isSubmitting || (isEditMode && !isDirty)}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isSubmitting
            ? isUploading
              ? `Subiendo... ${uploadProgress}%`
              : "Publicando..."
            : isEditMode
              ? isDirty
                ? "Guardar cambios"
                : "Publicado"
              : "Publicar"}
        </Button>
      </Box>
    </Box>
  );
};

export default SubmitSection;
