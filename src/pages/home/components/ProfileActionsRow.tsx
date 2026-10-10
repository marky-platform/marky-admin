import React from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CancelButton from "../../../components/CancelButton";
import ProfileActionsMenu, {
  profileShareItems,
} from "../../../components/ProfileActionsMenu";

interface ProfileActionsRowProps {
  onEditProfile: () => void; // Abre el PresentationModal
  onSettings: () => void; // Función para configurar (futura)
}

// Solo desktop (md+). En mobile la edición vive junto al nombre del negocio y
// "Más acciones" en el Header, así que la fila no se renderiza.
const ProfileActionsRow: React.FC<ProfileActionsRowProps> = ({
  onEditProfile,
  onSettings,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) return null;

  return (
    <Box display="flex" alignItems="center" gap={3} mt={4}>
      <CancelButton
        sx={{
          paddingX: 2,
          flex: 1,
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        onClick={onEditProfile}
      >
        Editar Perfil
      </CancelButton>
      <IconButton
        onClick={onSettings}
        sx={{
          backgroundColor: "grey.200",
          borderRadius: 1,
          p: 3,
        }}
      >
        <SettingsIcon />
      </IconButton>
      <ProfileActionsMenu
        items={profileShareItems()}
        sx={{
          backgroundColor: "grey.200",
          borderRadius: 1,
          p: 3,
        }}
      />
    </Box>
  );
};

export default ProfileActionsRow;
