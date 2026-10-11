import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  SxProps,
  Theme,
} from "@mui/material";
import React from "react";
import { useTheme } from "../themes/ThemeContext";

interface ThemeModeToggleProps {
  /** `icon`: standalone icon button (public pages). `menuItem`: row inside a menu. */
  variant?: "icon" | "menuItem";
  /** Called after the mode changes (e.g. to close the parent menu). */
  onToggle?: () => void;
  sx?: SxProps<Theme>;
}

// Reusable light/dark switch. Admin renders it as a menu row, public pages as
// an icon button; both change the same persisted preference.
const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  variant = "icon",
  onToggle,
  sx,
}) => {
  const { resolvedMode, toggleMode } = useTheme();
  const goingDark = resolvedMode === "light";
  const label = goingDark ? "Modo oscuro" : "Modo claro";
  const Icon = goingDark ? DarkModeOutlinedIcon : LightModeOutlinedIcon;

  const handleClick = () => {
    toggleMode();
    onToggle?.();
  };

  if (variant === "menuItem") {
    return (
      <MenuItem sx={sx ?? { p: 4 }} onClick={handleClick}>
        <ListItemIcon>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </MenuItem>
    );
  }

  return (
    <IconButton aria-label={label} onClick={handleClick} sx={sx}>
      <Icon />
    </IconButton>
  );
};

export default ThemeModeToggle;
