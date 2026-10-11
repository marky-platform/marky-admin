import { withInsetSurface } from "../../../themes/InsetSurface";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  ButtonBase,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import XButton from "../../../components/XButton";
import BusinessAvatar from "./BusinessAvatar";
import { ShowNotification } from "../../../utils/utils";
import { ALL_CHANNEL_KEYS, CHANNEL_META } from "./channels/channels.constants";

interface PresentationModalProps {
  open: boolean;
  onClose: () => void;
  onEditPhoto: () => void;
  onEditName: () => void;
  onEditUsername: () => void;
  onEditChannels: () => void;
  onEditDescription: () => void;
  onEditLocations: () => void;
  onEditAttributes: () => void;
  profilePhoto?: string;
  businessId?: string;
  values: any;
}

interface MobileRowProps {
  label: string;
  value?: string;
  placeholder?: string;
  onClick?: () => void;
  last?: boolean;
}

const MobileRow: React.FC<MobileRowProps> = ({
  label,
  value,
  placeholder,
  onClick,
  last,
}) => {
  const rowSx = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 2,
    px: 4,
    py: 3,
    borderBottom: last
      ? "none"
      : (theme: Theme) => `1px solid ${theme.palette.border.divider}`,
  };
  const content = (
    <>
      <Box flex={1} minWidth={0} textAlign="left">
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 1 }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: value ? "text.primary" : "grey.900",
            fontWeight: value ? 700 : 400,
            wordBreak: "break-word",
          }}
        >
          {value || placeholder}
        </Typography>
      </Box>
      {onClick && (
        <ChevronRightIcon sx={{ color: "text.disabled" }} />
      )}
    </>
  );

  return onClick ? (
    <ButtonBase onClick={onClick} sx={rowSx}>
      {content}
    </ButtonBase>
  ) : (
    <Box sx={rowSx}>{content}</Box>
  );
};

const PresentationModal: React.FC<PresentationModalProps> = ({
  open,
  onClose,
  onEditPhoto,
  onEditName,
  onEditUsername,
  onEditChannels,
  onEditDescription,
  onEditLocations,
  onEditAttributes,
  businessId,
  values,
}) => {
  const { socialMedia, description, attributes, locations, profilePhoto } =
    values;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const filledChannelKeys = socialMedia
    ? ALL_CHANNEL_KEYS.filter((key) =>
        (socialMedia[key] || []).some(
          (entry: any) => entry.url && entry.url.trim() !== "",
        ),
      )
    : [];
  const hasChannels = filledChannelKeys.length > 0;
  const hasDescription = description && description.trim() !== "";
  const hasLocations = locations && locations.length > 0;
  const hasAttributes = attributes && attributes.length > 0;

  const handleCopyLink = async () => {
    if (!businessId) return;
    try {
      await navigator.clipboard.writeText(`marky.one/${businessId}`);
      ShowNotification({ message: "Enlace copiado", type: "success" });
    } catch {
      ShowNotification({ message: "No se pudo copiar el enlace", type: "error" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={isMobile}>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          borderBottom: (theme) => `1px solid ${theme.palette.border.divider}`,
        }}
      >
        <DialogTitle sx={{ flex: 1 }}>Editar perfil</DialogTitle>
        <Box display={"flex"} sx={{ paddingY: 3 }}>
          <XButton
            onClick={onClose}
            sx={{
              marginRight: 3,
              ...(isMobile && {
                backgroundColor: "grey.400",
                borderRadius: "6px",
                "&:hover": { backgroundColor: "grey.400" },
              }),
            }}
          />
        </Box>
      </Box>
      <DialogContent sx={{ p: 0, maxHeight: isMobile ? undefined : "80vh" }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={3}
          sx={{
            px: 4,
            py: 3,
            borderBottom: (theme) => `1px solid ${theme.palette.border.divider}`,
          }}
        >
          <BusinessAvatar photo={profilePhoto} size={92} />
          <Button
            variant="outlined"
            onClick={onEditPhoto}
            sx={{
              borderColor: "grey.800",
              color: "text.primary",
              px: 3,
              boxShadow: 0,
              textTransform: "none",
            }}
          >
            Cambiar foto
          </Button>
        </Box>

        <MobileRow
          label="Nombre"
          value={values.business_name}
          onClick={onEditName}
        />
        <MobileRow
          label="Usuario"
          value={businessId}
          placeholder="Agrega tu usuario"
          onClick={onEditUsername}
        />
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{
            width: "100%",
            px: 4,
            py: 3,
            borderBottom: (theme) => `1px solid ${theme.palette.border.divider}`,
          }}
        >
          <Box flex={1} minWidth={0}>
            <Typography
              variant="body2"
              sx={{ color: "text.primary", mb: 1 }}
            >
              Tu enlace público
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 700,
                wordBreak: "break-word",
              }}
            >
              marky.one/{businessId || "..."}
            </Typography>
          </Box>
          <IconButton onClick={handleCopyLink} size="small">
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>

        <MobileRow
          label="Canales"
          value={
            hasChannels
              ? filledChannelKeys.map((key) => CHANNEL_META[key].label).join(", ")
              : undefined
          }
          placeholder="Agrega tus canales de marca"
          onClick={onEditChannels}
        />
        <MobileRow
          label="Descripción"
          value={hasDescription ? description : undefined}
          placeholder="Escribe una breve descripción sobre tu negocio y cuál es tu producto estrella de tu propuesta."
          onClick={onEditDescription}
        />
        <MobileRow
          label="Ubicaciones"
          value={
            hasLocations
              ? locations.map((loc: any) => loc.name).join(", ")
              : undefined
          }
          placeholder="Añade tus direcciones más importantes"
          onClick={onEditLocations}
        />
        <MobileRow
          label="Atributos"
          value={
            hasAttributes
              ? attributes.map((attr: any) => attr.name).join(", ")
              : undefined
          }
          placeholder="Identifica lo que te distingue"
          onClick={onEditAttributes}
          last
        />
      </DialogContent>
    </Dialog>
  );
};

export default withInsetSurface(PresentationModal);
