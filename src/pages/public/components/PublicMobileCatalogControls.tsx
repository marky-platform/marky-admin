import { Box, Skeleton } from "@mui/material";
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
  /** La lista pública aún se está cargando: se reserva el alto de la fila de chips. */
  categoriesLoading?: boolean;
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
  categoriesLoading = false,
  viewMode,
  onViewModeChange,
  filterCounts,
}) => {
  // Con lista inyectada (catálogo público) la fila solo tiene sentido con 2+
  // categorías. Sin lista (home de admin) los chips cargan las categorías
  // propias, incluidas las vacías, así que la fila se mantiene siempre. Con una
  // categoría ya elegida la fila también se mantiene: "Todo" es la única forma
  // de quitar ese filtro en mobile si la lista se achica durante la sesión.
  const hasSelectedCategory = (values.categories?.length ?? 0) > 0;
  const showCategoryChips =
    categories === undefined || categories.length >= 2 || hasSelectedCategory;
  // Mientras carga la lista pública, un esqueleto con el mismo alto evita que la
  // fila aparezca de golpe y empuje el catálogo.
  const showChipsPlaceholder = !showCategoryChips && categoriesLoading;

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
      {showChipsPlaceholder && (
        <Box
          aria-hidden
          data-testid="catalog-controls-row-2-loading"
          sx={{
            mt: 2,
            borderTop: (theme) => `1px solid ${theme.palette.border.soft}`,
          }}
        >
          {/* Mismo padding y alto de chip que CategoryFilterChips. */}
          <Box sx={{ display: "flex", gap: 2, py: 3, px: 4, mx: -4 }}>
            {[56, 88, 72].map((width) => (
              <Skeleton
                key={width}
                variant="rounded"
                width={width}
                height={32}
                sx={{ borderRadius: "40px", flexShrink: 0 }}
              />
            ))}
          </Box>
        </Box>
      )}
      {showCategoryChips && (
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
      )}
    </Box>
  );
};

export default PublicMobileCatalogControls;
