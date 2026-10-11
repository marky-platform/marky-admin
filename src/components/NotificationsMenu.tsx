import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "../hooks/useNotificationMutations";
import { Notification } from "../types/notification";
import LoadingSpinner from "./LoadingSpinner";
import SectionErrorBoundary from "./SectionErrorBoundary";
import { formatRelativeTime } from "../utils/relativeTime";

const NotificationsMenuContent: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = data?.results ?? [];

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    onClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size={28} message="Cargando notificaciones..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No se pudieron cargar las notificaciones.
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No tienes notificaciones.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          px: 4,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Notificaciones
        </Typography>
        <Button size="small" onClick={() => markAllRead()}>
          Marcar todas como leídas
        </Button>
      </Box>
      <Divider />
      {notifications.map((notification) => (
        <MenuItem
          key={notification.id}
          sx={{ p: 4, alignItems: "flex-start", whiteSpace: "normal" }}
          onClick={() => handleNotificationClick(notification)}
        >
          <ListItemText
            primary={
              <Typography
                variant="body2"
                sx={{ fontWeight: notification.isRead ? 400 : 700 }}
              >
                {notification.title}
              </Typography>
            }
            secondary={
              <Box component="span" sx={{ display: "block" }}>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {formatRelativeTime(notification.createdAt)}
                </Typography>
              </Box>
            }
          />
        </MenuItem>
      ))}
    </>
  );
};

const NotificationsMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  // Unconditional (not gated on `open`) so the badge count is visible as
  // soon as the page loads, not only after the user opens the dropdown.
  // Shares its cache entry (same query key/params) with the list fetched
  // inside NotificationsMenuContent below, so opening the menu doesn't
  // trigger a second request within the staleTime window.
  const { data } = useNotifications();
  const unreadCount = data?.unread_count ?? 0;

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ width: 34, height: 34, p: 0, flexShrink: 0 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon sx={{ color: "grey.900" }} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        PaperProps={{
          sx: {
            minWidth: 340,
            maxWidth: 400,
            maxHeight: 480,
            py: 2,
            backgroundColor: "surface.main",
            borderRadius: 2,
          },
        }}
      >
        <SectionErrorBoundary>
          <NotificationsMenuContent onClose={handleClose} />
        </SectionErrorBoundary>
      </Menu>
    </>
  );
};

export default NotificationsMenu;
