import React from "react";
import { Box, Dialog, Typography, ButtonBase } from "@mui/material";
import XButton from "../../../components/XButton";
import InsetSurface from "../../../themes/InsetSurface";

export interface EntryListPopupItem {
  id: string | number;
  label: string;
  onSelect: () => void;
}

interface EntryListPopupProps {
  open: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  businessName: string;
  subtitle: string;
  items: EntryListPopupItem[];
}

const EntryListPopup: React.FC<EntryListPopupProps> = ({
  open,
  onClose,
  icon,
  businessName,
  subtitle,
  items,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "22px",
          p: 4,
          textAlign: "center",
          position: "relative",
        },
      }}
    >
      <InsetSurface>
      <Box sx={{ position: "absolute", top: 12, right: 12 }}>
        <XButton onClick={onClose} />
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "secondary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "text.heading" }}>
              {businessName}
            </Typography>
            <Typography sx={{ fontSize: 14, color: "grey.900" }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gap={2} width="100%">
          {items.map((item) => (
            <ButtonBase
              key={item.id}
              onClick={() => {
                item.onSelect();
                onClose();
              }}
              sx={{
                width: "100%",
                py: 3,
                px: 3,
                border: (theme) => `1px solid ${theme.palette.grey[800]}`,
                borderRadius: "9999px",
                backgroundColor: "grey.100",
              }}
            >
              <Typography
                sx={{ color: "primary.main", fontWeight: 700, fontSize: 14 }}
              >
                {item.label}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      </Box>
      </InsetSurface>
    </Dialog>
  );
};

export default EntryListPopup;
