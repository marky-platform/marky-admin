import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import CancelButton from "../../../components/CancelButton";
import ProfileActionsMenu, {
  profileShareItems,
} from "../../../components/ProfileActionsMenu";

interface ProfileActionsRowProps {
  onEditProfile: () => void; // Abre el PresentationModal
}

// Solo desktop (md+). En mobile la edición vive junto al nombre del negocio y
// "Más acciones" en el Header, así que la fila no se renderiza.
const ProfileActionsRow: React.FC<ProfileActionsRowProps> = ({
  onEditProfile,
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
