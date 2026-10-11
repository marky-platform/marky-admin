import React from "react";
import { Box, Typography } from "@mui/material";

interface CustomRadioLabelProps {
  label: string;
  backgroundColor?: string;
  color?: string;
  fontColor?: string;
}

const CustomRadioLabel: React.FC<CustomRadioLabelProps> = ({
  label,
  backgroundColor = "fixed.radioDot",
  color = "fixed.stopperFavoriteTextCard",
  fontColor,
}) => {
  return (
    <Box
      sx={{
        width: "fit-content",
        backgroundColor: backgroundColor,
        color: color,
        fontWeight: "500",
        fontSize: "0.875rem",
        lineHeight: "32px",
        position: "relative",
        borderRight: "20px solid transparent",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        pl: 2,
        mb: 2,
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0% 100%)",
      }}
    >
      <Typography
        component="span"
        sx={{ fontSize: "0.875rem", fontWeight: "500", color: fontColor }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default CustomRadioLabel;
