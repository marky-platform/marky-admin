import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  AppBar,
  Avatar,
  Box,
  ButtonBase,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Divider,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoMarky from "../assets/images/marky-logo.svg";
import defaultUserAvatar from "../assets/images/user_default.png";
import { ROUTES } from "../routes/paths";
import { useSessionStore } from "../stores/sessionStore";
import NotificationsMenu from "./NotificationsMenu";

export const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useSessionStore();

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backgroundColor: "white",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 55, sm: 55, md: 55 },
          maxHeight: 55,
          py: 2,
          px: 8,
          gap: 6,
          borderBottom: "1px solid #E5E7EB",
          boxSizing: "border-box",
        }}
      >
        <Box display="flex" alignItems="center" flexGrow={1}>
          <ButtonBase
            onClick={() => navigate(ROUTES.HOME)}
            sx={{ borderRadius: 1 }}
            aria-label="Ir a inicio"
          >
            <img
              src={logoMarky}
              alt="Marky"
              style={{ height: 24, marginRight: theme.spacing(1) }}
            />
          </ButtonBase>
        </Box>
        <NotificationsMenu />
        <IconButton
          color="inherit"
          onClick={handleProfileClick}
          aria-label="user-menu"
          sx={{ p: 1 }}
        >
          <Avatar src={defaultUserAvatar} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              minWidth: 260,
              px: 1,
              py: 2,
              backgroundColor: "white",
              borderRadius: 2,
            },
          }}
        >
          <Box sx={{ px: 4, pb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.business_name ?? user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.username}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            sx={{ p: 4 }}
            onClick={() => {
              handleClose();
              navigate("/account/configuration");
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mi cuenta</ListItemText>
          </MenuItem>
          <MenuItem
            sx={{ p: 4 }}
            onClick={() => {
              handleClose();
              navigate("/logout");
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cerrar sesión</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
