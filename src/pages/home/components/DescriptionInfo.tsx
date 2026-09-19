// DescriptionInfo.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

interface DescriptionInfoProps {
  description: string;
  onOpen: () => void;
  readOnly?: boolean;
}

const DescriptionInfo: React.FC<DescriptionInfoProps> = ({
  description,
  onOpen,
  readOnly = false,
}) => {
  const isEmpty = !description;
  if (isEmpty && readOnly) return null;
  return (
    <Box
      onClick={readOnly ? undefined : onOpen}
      sx={{
        border: isEmpty ? "1px dashed #B8CDF5" : "none",
        backgroundColor: isEmpty ? "#FAFCFF" : "transparent",
        borderRadius: isEmpty ? "6px" : 0,
        py: isEmpty ? 4 : 0,
        px: isEmpty ? 3 : 0,
        cursor: readOnly ? "default" : "pointer",
      }}
    >
      {isEmpty ? (
        <Typography
          sx={{
            color: "#2563EB",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "22px",
            textAlign: "center",
          }}
        >
          Agrega una descripción
        </Typography>
      ) : (
        <Typography
          sx={{
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            fontSize: 14,
            color: "#374151",
            lineHeight: "18px",
            fontWeight: 400,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default DescriptionInfo;
