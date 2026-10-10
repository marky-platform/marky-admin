import { Box, Chip } from "@mui/material";
import React from "react";

interface CatalogFilterPillsProps {
  offer: boolean;
  featured: boolean;
  /** Productos que cumplen cada filtro; se omite el número si no hay dato. */
  counts?: { promotion?: number; featured?: number };
  onChange: (next: { offer?: boolean; featured?: boolean }) => void;
}

const pillSx = (active: boolean) => ({
  flexShrink: 0,
  borderRadius: "40px",
  px: 1,
  py: 2.5,
  fontWeight: 500,
  border: "1px solid",
  borderColor: active ? "primary.main" : "grey.300",
  bgcolor: active ? "primary.main" : "common.white",
  color: active ? "common.white" : "#4F4F4F",
  "&:hover": { bgcolor: active ? "primary.main" : "grey.100" },
});

// Píldoras "Todos / Promociones / Destacados" (Figma). Promociones y
// Destacados se combinan entre sí; "Todos" limpia ambas.
const CatalogFilterPills: React.FC<CatalogFilterPillsProps> = ({
  offer,
  featured,
  counts,
  onChange,
}) => {
  const withCount = (label: string, count?: number) =>
    typeof count === "number" ? `${label} ${count}` : label;

  const items = [
    {
      key: "all",
      label: "Todos",
      active: !offer && !featured,
      onClick: () => onChange({ offer: false, featured: false }),
    },
    {
      key: "offer",
      label: withCount("Promociones", counts?.promotion),
      active: offer,
      onClick: () => onChange({ offer: !offer }),
    },
    {
      key: "featured",
      label: withCount("Destacados", counts?.featured),
      active: featured,
      onClick: () => onChange({ featured: !featured }),
    },
  ];

  return (
    <Box
      role="group"
      aria-label="Filtros de productos"
      sx={{ display: "flex", gap: 2, flexShrink: 0 }}
    >
      {items.map((item) => (
        <Chip
          key={item.key}
          label={item.label}
          clickable
          onClick={item.onClick}
          aria-pressed={item.active}
          sx={pillSx(item.active)}
        />
      ))}
    </Box>
  );
};

export default CatalogFilterPills;
