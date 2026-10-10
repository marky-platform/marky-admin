import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Box, IconButton } from "@mui/material";
import React from "react";
import { CatalogViewMode } from "../hooks/useCatalogViewMode";

interface CatalogViewToggleProps {
  value: CatalogViewMode;
  onChange: (mode: CatalogViewMode) => void;
}

const OPTIONS: {
  mode: CatalogViewMode;
  label: string;
  Icon: typeof GridViewIcon;
}[] = [
  { mode: "grid", label: "Vista de mosaico", Icon: GridViewIcon },
  { mode: "list", label: "Vista de lista", Icon: ViewListIcon },
];

// Selector mosaico/lista (Figma "Cambiar visualización"): dos botones de
// ícono dentro de un contenedor con borde; el activo va relleno en azul.
const CatalogViewToggle: React.FC<CatalogViewToggleProps> = ({
  value,
  onChange,
}) => (
  <Box
    role="group"
    aria-label="Cambiar visualización"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: "2px",
      p: "5px",
      border: "1px solid",
      borderColor: "grey.300",
      borderRadius: 2,
      flexShrink: 0,
    }}
  >
    {OPTIONS.map(({ mode, label, Icon }) => {
      const active = value === mode;
      return (
        <IconButton
          key={mode}
          aria-label={label}
          aria-pressed={active}
          onClick={() => onChange(mode)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: active ? "primary.main" : "transparent",
            color: active ? "common.white" : "grey.600",
            "&:hover": {
              bgcolor: active ? "primary.main" : "grey.100",
            },
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </IconButton>
      );
    })}
  </Box>
);

export default CatalogViewToggle;
