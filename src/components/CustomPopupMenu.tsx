import React from "react";
import { Menu, MenuItem, SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

interface CustomPopupMenuItem {
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg"> | any>;
  text: string;
  onClick: () => void;
  /** Acción destructiva (p. ej. "Reportar"): se muestra en rojo. */
  destructive?: boolean;
}

interface CustomPopupMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  menuItems: CustomPopupMenuItem[];
  /** `above-start` (default) abre hacia arriba del disparador; `below-end` abre
   * debajo y alineado a su borde derecho (disparadores en una barra superior). */
  placement?: "above-start" | "below-end";
  /** id del menú, para `aria-controls` del disparador. */
  id?: string;
}

const CustomPopupMenu: React.FC<CustomPopupMenuProps> = ({
  anchorEl,
  open,
  onClose,
  menuItems,
  placement = "above-start",
  id,
}) => {
  const isBelowEnd = placement === "below-end";
  return (
    <Menu
      id={id}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={
        isBelowEnd
          ? { vertical: "bottom", horizontal: "right" }
          : { vertical: "top", horizontal: "left" }
      }
      transformOrigin={
        isBelowEnd
          ? { vertical: "top", horizontal: "right" }
          : { vertical: "bottom", horizontal: "center" }
      }
      // PaperProps={{
      //   sx: {
      //     "& .MuiMenuItem-root": {
      //       mb: 4,
      //       mt: 1,
      //     },
      //   },
      // }}
      PaperProps={{
        sx: {
          marginTop: isBelowEnd ? 1 : 2,
          backgroundColor: "white", // light custom background
          p: 2, // inner padding
          maxWidth: 220, // optional, for spacing
        },
      }}
      sx={
        {
          // "& .MuiPaper-root": {
          //   backgroundColor: "background.default",
          //   borderRadius: 2,
          //   boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          //   minWidth: 200,
          // },
          // "& .MuiMenuItem-root": {
          //   fontSize: "0.9rem",
          //   paddingY: 1,
          //   "&:hover": {
          //     backgroundColor: "#e0e0e0",
          //   },
          // },
        }
      }
    >
      {menuItems.map((item) => (
        <MenuItem
          key={item.text}
          onClick={item.onClick}
          sx={{
            borderRadius: 2,
            p: 3,
            display: "flex",
            gap: 4,
            ...(item.destructive && { color: "error.main" }),
          }}
        >
          <item.icon fontSize="small" />
          {item.text}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default CustomPopupMenu;
