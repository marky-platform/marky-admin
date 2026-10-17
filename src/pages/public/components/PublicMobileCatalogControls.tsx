import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { Box } from "@mui/material";
import React from "react";
import CatalogFilterPills from "../../../components/CatalogFilterPills";
import CatalogViewToggle from "../../../components/CatalogViewToggle";
import ProfileActionsMenu from "../../../components/ProfileActionsMenu";
import { CatalogViewMode } from "../../../hooks/useCatalogViewMode";
import useProfileShareActions from "../../../hooks/useProfileShareActions";
import CategoryFilterChips from "../../home/components/CategoryFilterChips";
import { Category } from "../../home/components/CategoryFilterModal";

interface PublicMobileCatalogControlsProps {
  values: { categories: Category[]; offer: boolean; featured: boolean };
  onFilterChange: (next: any) => void;
  categories: Category[];
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  filterCounts?: { promotion?: number; featured?: number };
  businessId: string;
  businessName?: string;
}

// Controles del catálogo público por debajo de md (xs+sm), en dos filas:
// 1) Promociones / Destacados + selector de vista + "Más acciones";
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
  businessId,
  businessName,
}) => {
  const shareItems = useProfileShareActions({ businessId, businessName });

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
        <ProfileActionsMenu
          placement="below-end"
          sx={{ flexShrink: 0 }}
          items={[
            ...shareItems,
            {
              icon: FlagOutlinedIcon,
              text: "Reportar",
              onClick: () => {},
              destructive: true,
            },
          ]}
        />
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
