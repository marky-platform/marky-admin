import React from "react";
import { Box, Dialog, Typography, ButtonBase } from "@mui/material";
import XButton from "../../../components/XButton";
import colors from "../../../themes/utils/colors";

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
              backgroundColor: colors.light.secondary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#292929" }}>
              {businessName}
            </Typography>
            <Typography sx={{ fontSize: 14, color: colors.light.grey[900] }}>
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
                border: `1px solid ${colors.light.grey[800]}`,
                borderRadius: "9999px",
                backgroundColor: colors.light.grey[100],
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
    </Dialog>
  );
};

export default EntryListPopup;
