import { Box, Chip } from "@mui/material";
import React from "react";
import { CATALOG_CONTROL_HEIGHT } from "./CatalogViewToggle";

interface CatalogFilterPillsProps {
  offer: boolean;
  featured: boolean;
  /** Productos que cumplen cada filtro; se omite el número si no hay dato. */
  counts?: { promotion?: number; featured?: number };
  onChange: (next: { offer: boolean; featured: boolean }) => void;
}

const pillSx = (active: boolean) => ({
  flexShrink: 0,
  height: CATALOG_CONTROL_HEIGHT,
  borderRadius: "40px",
  px: 1,
  fontWeight: 500,
  border: "1px solid",
  borderColor: active ? "primary.main" : "grey.300",
  bgcolor: active ? "primary.main" : "common.white",
  color: active ? "common.white" : "#4F4F4F",
  "&:hover": { bgcolor: active ? "primary.main" : "grey.100" },
});

const CountBubble: React.FC<{ count: number; active: boolean }> = ({
  count,
  active,
}) => (
  <Box
    component="span"
    data-testid="filter-count"
    aria-hidden
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 24,
      height: 24,
      px: 1,
      ml: 2,
      borderRadius: "12px",
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1,
      bgcolor: active ? "common.white" : "#E8F3FF",
      color: "primary.main",
    }}
  >
    {count}
  </Box>
);

// Píldoras "Todos / Promociones / Destacados" (Figma). Son de selección
// única: elegir una desactiva la otra, y volver a pulsar la activa regresa a
// "Todos". "Todos" no muestra contador.
const CatalogFilterPills: React.FC<CatalogFilterPillsProps> = ({
  offer,
  featured,
  counts,
  onChange,
}) => {
  const items = [
    {
      key: "all",
      label: "Todos",
      count: undefined,
      active: !offer && !featured,
      onClick: () => onChange({ offer: false, featured: false }),
    },
    {
      key: "offer",
      label: "Promociones",
      count: counts?.promotion,
      active: offer,
      onClick: () => onChange({ offer: !offer, featured: false }),
    },
    {
      key: "featured",
      label: "Destacados",
      count: counts?.featured,
      active: featured,
      onClick: () => onChange({ offer: false, featured: !featured }),
    },
  ];

  return (
    <Box
      role="group"
      aria-label="Filtros de productos"
      sx={{ display: "flex", gap: 2, flexShrink: 0 }}
    >
      {items.map((item) => {
        const showCount = typeof item.count === "number" && item.count > 0;
        return (
          <Chip
            key={item.key}
            aria-label={showCount ? `${item.label} ${item.count}` : item.label}
            label={
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
                {item.label}
                {showCount && (
                  <CountBubble count={item.count as number} active={item.active} />
                )}
              </Box>
            }
            clickable
            onClick={item.onClick}
            aria-pressed={item.active}
            sx={pillSx(item.active)}
          />
        );
      })}
    </Box>
  );
};

export default CatalogFilterPills;
