import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Box } from "@mui/material";
import React from "react";
import logoMarky from "../../../assets/images/marky-logo.svg";
import ProfileActionsMenu, {
  profileShareItems,
} from "../../../components/ProfileActionsMenu";
import { HEADER_HEIGHT } from "../../../constants/layout";
import BusinessAvatar from "../../home/components/BusinessAvatar";

interface PublicMobileTopBarProps {
  businessPhoto?: unknown;
}

// Barra superior mobile del perfil público (< md): logo + avatar del negocio +
// "Más acciones". Es anónima a propósito: sin notificaciones ni menú de cuenta.
// "Reportar" es un placeholder, igual que las demás acciones: no hay flujo
// de reportes todavía.
const PublicMobileTopBar: React.FC<PublicMobileTopBarProps> = ({
  businessPhoto,
}) => (
  <Box
    component="header"
    sx={{
      display: { xs: "flex", md: "none" },
      alignItems: "center",
      gap: 4,
      position: "sticky",
      top: 0,
      zIndex: (theme) => theme.zIndex.appBar,
      boxSizing: "border-box",
      height: HEADER_HEIGHT,
      px: 4,
      bgcolor: "#F8F8FA",
      borderBottom: "1px solid #E5E7EB",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
      <img src={logoMarky} alt="Marky" style={{ height: 24 }} />
    </Box>
    <BusinessAvatar photo={businessPhoto} size={34} />
    <ProfileActionsMenu
      placement="below-end"
      items={[
        ...profileShareItems(),
        {
          icon: FlagOutlinedIcon,
          text: "Reportar",
          onClick: () => {},
          destructive: true,
        },
      ]}
    />
  </Box>
);

export default PublicMobileTopBar;
