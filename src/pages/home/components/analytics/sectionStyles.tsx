import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Typography
    component="h3"
    sx={{ fontSize: 14, fontWeight: 600, color: "text.strong", mb: 2 }}
  >
    {children}
  </Typography>
);

export const Section = ({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) => (
  <Box
    component="section"
    sx={{
      py: 4,
      borderTop: (t) => `1px solid ${t.palette.border.divider}`,
    }}
  >
    <SectionTitle>{title}</SectionTitle>
    {caption && (
      <Typography sx={{ fontSize: 12, color: "text.muted", mt: -1, mb: 3 }}>
        {caption}
      </Typography>
    )}
    {children}
  </Box>
);

/** Fila "etiqueta + barra proporcional + valor" (orígenes y acciones). */
export const MeterRow = ({
  label,
  value,
  ratio,
}: {
  label: string;
  value: string;
  ratio: number;
}) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 1, mb: 3 }}>
    <Typography sx={{ fontSize: 13, color: "text.body" }}>{label}</Typography>
    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.strong" }}>
      {value}
    </Typography>
    <Box
      aria-hidden
      sx={{
        gridColumn: "1 / -1",
        height: 6,
        borderRadius: 3,
        bgcolor: "surface.muted",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${Math.round(ratio * 100)}%`,
          bgcolor: "primary.main",
          borderRadius: 3,
        }}
      />
    </Box>
  </Box>
);
