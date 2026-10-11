import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import React, { useState } from "react";

interface Props {
  onPromo: () => void;
  onDelete: () => void;
}

const MobileOptionsMenu: React.FC<Props> = ({ onPromo, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small">
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              p: 1,
              boxShadow: (theme) => `1px 2px 3.5px ${theme.palette.shadow.soft}`,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onPromo();
            handleClose();
          }}
          sx={{
            borderRadius: 1.5,
            gap: 1.5,
            "&:hover": { bgcolor: "grey.50" },
          }}
        >
          <LocalOfferIcon fontSize="small" sx={{ color: "text.body" }} />
          <Typography sx={{ fontSize: 14, color: "text.body" }}>
            Promo
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete();
            handleClose();
          }}
          sx={{ borderRadius: 1.5, gap: 1.5 }}
        >
          <DeleteIcon fontSize="small" sx={{ color: "accent.danger" }} />
          <Typography sx={{ fontSize: 14, color: "accent.danger" }}>
            Eliminar
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default MobileOptionsMenu;
