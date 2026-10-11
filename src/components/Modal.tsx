import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Modal, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import InsetSurface from "../themes/InsetSurface";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  secondaryAction?: () => void;
  primaryAction?: (args: object | undefined) => void;
  secondaryActionLabel?: string;
  primaryActionLabel?: string;
  children: React.ReactNode;
  title?: string;
  primaryActionParams?: object;
  // Opcional: permite sobreescribir o extender los estilos por defecto
  sx?: object;
  // Oculta el footer predeterminado (útil cuando el contenido ya maneja botones)
  hideFooter?: boolean;
  // Muestra un botón de volver (flecha) a la izquierda del título
  onBack?: () => void;
  // Muestra un botón de cerrar (X) a la derecha del título
  showCloseButton?: boolean;
  // En mobile, ocupa toda la pantalla (header y footer fijos) en vez de un diálogo centrado
  fullScreenOnMobile?: boolean;
}

const CustomModalContent: React.FC<CustomModalProps> = ({
  open,
  title = "Insert title here",
  onClose,
  secondaryAction,
  primaryAction,
  secondaryActionLabel = "Cancelar",
  primaryActionLabel = "Aceptar",
  children,
  primaryActionParams,
  sx,
  hideFooter = false,
  onBack,
  showCloseButton = false,
  fullScreenOnMobile = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isFullScreen = fullScreenOnMobile && isMobile;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={
          isFullScreen
            ? {
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100dvh",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                borderRadius: 0,
                ...sx,
              }
            : {
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: 24,
                borderRadius: 1, // Opcional, para redondear esquinas
                ...sx, // Permite extender o sobreescribir los estilos predeterminados
              }
        }
      >
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.border.modal}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            paddingRight: onBack || showCloseButton ? 3 : 0,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {onBack && (
              <IconButton onClick={onBack} sx={{ marginLeft: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography
              id="modal-title"
              variant="h6"
              component="h2"
              sx={{ p: 4, paddingLeft: onBack ? 1 : 4 }}
            >
              {title}
            </Typography>
          </Box>
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: theme.palette.grey[400],
                borderRadius: "50%",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        {/*  */}
        <Box
          id="modal-description"
          sx={{
            p: 4,
            ...(isFullScreen ? { flex: 1, overflowY: "auto" } : {}),
          }}
        >
          {children}
        </Box>
        {/*  */}
        {!hideFooter && (
          <Box
            sx={
              isFullScreen
                ? {
                    borderTop: "1px solid lightgray",
                    display: "flex",
                    paddingX: theme.spacing(5.25),
                    paddingY: theme.spacing(2.75),
                    justifyContent: "flex-end",
                    gap: theme.spacing(3),
                    flexShrink: 0,
                    mt: "auto",
                  }
                : {
                    borderTop: "1px solid lightgray",
                    display: "flex",
                    p: 4,
                    justifyContent: "flex-end",
                    gap: 4,
                    flexShrink: 0,
                  }
            }
          >
            {
              <>
                <Button
                  onClick={secondaryAction ? secondaryAction : onClose}
                  type="button"
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.grey[600],
                    color: theme.palette.text.secondary,
                    paddingX: "1rem",
                    ...(isFullScreen
                      ? {
                          flex: 1,
                          backgroundColor: theme.palette.grey[400],
                          borderRadius: theme.spacing(1.5),
                          padding: theme.spacing(3),
                        }
                      : {}),
                  }}
                >
                  {secondaryActionLabel}
                </Button>
                {primaryAction && (
                  <Button
                    onClick={() => primaryAction(primaryActionParams)}
                    type="button"
                    variant="contained"
                    color="primary"
                    sx={{
                      paddingX: "1rem",
                      ...(isFullScreen
                        ? {
                            flex: 1,
                            backgroundColor: theme.palette.accent.link,
                            borderRadius: theme.spacing(1.5),
                            padding: theme.spacing(3),
                          }
                        : {}),
                    }}
                  >
                    {primaryActionLabel}
                  </Button>
                )}
              </>
            }
          </Box>
        )}
      </Box>
    </Modal>
  );
};

// Fields inside a modal read as inset in dark mode (see InsetSurface).
const CustomModal: React.FC<CustomModalProps> = (props) => (
  <InsetSurface>
    <CustomModalContent {...props} />
  </InsetSurface>
);

export default CustomModal;
