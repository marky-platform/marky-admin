import { Box, Typography } from "@mui/material";
import React from "react";

// Pill de solo lectura (ingredientes, alérgenos, declaraciones SIN TACC) del
// detalle de producto. Mismo lenguaje visual que RemovableTag (fondo
// secundario, radio 6px) pero sin el botón de quitar.
export const InfoPillList: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <Box
    component="ul"
    aria-label={label}
    sx={{
      display: "flex",
      flexWrap: "wrap",
      gap: 2,
      listStyle: "none",
      m: 0,
      p: 0,
    }}
  >
    {children}
  </Box>
);

const InfoPill: React.FC<{ label: string }> = ({ label }) => (
  <Box
    component="li"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      bgcolor: "secondary.main",
      borderRadius: 1.5,
      px: 2,
      maxWidth: "100%",
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: "primary.main",
        lineHeight: "16px",
        wordBreak: "break-word",
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default InfoPill;
