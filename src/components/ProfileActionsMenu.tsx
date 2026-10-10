import MoreVertIcon from "@mui/icons-material/MoreVert";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { IconButton, SxProps, Theme } from "@mui/material";
import React, { useId, useState } from "react";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import CustomPopupMenu from "./CustomPopupMenu";

export interface ProfileActionItem {
  icon: OverridableComponent<any>;
  text: string;
  onClick: () => void;
  destructive?: boolean;
}

const noop = () => {};

// Acciones de perfil comunes a admin y público. Siguen siendo placeholders:
// todavía no existe un flujo de compartir / copiar URL / QR (solo se cierra el
// menú), así que el cableado real queda para un ticket de producto aparte.
export const profileShareItems = (): ProfileActionItem[] => [
  { icon: ShareIcon, text: "Compartir perfil", onClick: noop },
  { icon: ContentCopyIcon, text: "Copiar URL del perfil", onClick: noop },
  { icon: QrCodeIcon, text: "Código QR", onClick: noop },
];

interface ProfileActionsMenuProps {
  items: ProfileActionItem[];
  placement?: "above-start" | "below-end";
  sx?: SxProps<Theme>;
}

// Disparador "Más acciones" (⋮) + su menú. Cada pantalla decide qué items pasa
// (admin vs. público) para que el rol quede explícito en el sitio de uso.
const ProfileActionsMenu: React.FC<ProfileActionsMenuProps> = ({
  items,
  placement = "above-start",
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuId = useId();
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        aria-label="Más acciones"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={sx}
      >
        <MoreVertIcon />
      </IconButton>
      <CustomPopupMenu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        placement={placement}
        menuItems={items.map((item) => ({
          ...item,
          onClick: () => {
            close();
            item.onClick();
          },
        }))}
      />
    </>
  );
};

export default ProfileActionsMenu;
