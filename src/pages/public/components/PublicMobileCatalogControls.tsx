import { Box } from "@mui/material";
import React from "react";
import CatalogFilterPills from "../../../components/CatalogFilterPills";
import CatalogViewToggle from "../../../components/CatalogViewToggle";
import { CatalogViewMode } from "../../../hooks/useCatalogViewMode";
import CategoryFilterChips from "../../home/components/CategoryFilterChips";
import { Category } from "../../home/components/CategoryFilterModal";

interface PublicMobileCatalogControlsProps {
  values: { categories: Category[]; offer: boolean; featured: boolean };
  onFilterChange: (next: any) => void;
  /** Sin lista inyectada (admin) los chips cargan las categorías propias. */
  categories?: Category[];
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  filterCounts?: { promotion?: number; featured?: number };
}

// Controles del catálogo público por debajo de md (xs+sm), en dos filas:
// 1) Promociones / Destacados + selector de vista;
// 2) "Todo" + chips de categoría. El estado de promo/destacado y el de
// categoría son independientes: "Todo" solo limpia categorías.
const PublicMobileCatalogControls: React.FC<
  PublicMobileCatalogControlsProps
> = ({
  values,
  onFilterChange,
  categories,
  viewMode,
  onViewModeChange,
  filterCounts,
}) => {
  return (
    <Box>
      <Box
        data-testid="catalog-controls-row-1"
        sx={{ display: "flex", alignItems: "center", gap: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <CatalogFilterPills
            showAll={false}
            offer={Boolean(values.offer)}
            featured={Boolean(values.featured)}
            counts={filterCounts}
            onChange={onFilterChange}
          />
          <Box sx={{ ml: "auto", flexShrink: 0 }}>
            <CatalogViewToggle value={viewMode} onChange={onViewModeChange} />
          </Box>
        </Box>
      </Box>
      <Box
        data-testid="catalog-controls-row-2"
        sx={{
          mt: 2,
          borderTop: (theme) => `1px solid ${theme.palette.border.soft}`,
        }}
      >
        <CategoryFilterChips
          values={values}
          onFilterChange={onFilterChange}
          categories={categories}
        />
      </Box>
    </Box>
  );
};

export default PublicMobileCatalogControls;
