import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryGroup from "../../../components/CategoryGroup";
import LoadingSpinner from "../../../components/LoadingSpinner";
import usePublicCatalog from "../../../hooks/usePublicCatalog";
import useRetainedFilterCounts from "../../../hooks/useRetainedFilterCounts";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import CategoryFilterModal, {
  Category,
} from "../../home/components/CategoryFilterModal";
import FilterSection from "../../home/components/FilterSection";
import useCatalogViewMode from "../../../hooks/useCatalogViewMode";
import PublicMobileCatalogControls from "./PublicMobileCatalogControls";
import { getPublicProductPath } from "../../../utils/publicUrls";

interface FilterValues {
  search: string;
  categories: Category[];
  offer: boolean;
  featured: boolean;
}

interface PublicProductGridProps {
  businessId: string;
  categories: Category[];
}

// Read-only counterpart of pages/home/components/productGrid.tsx: same
// filter state shape, same client-side search (see the long comment below —
// ported verbatim from productGrid.tsx, the reasoning still applies), same
// has_promotion/ids params to the API. Drops the admin toolbar, every
// modal/dialog, the `?promoCategory=` deep link, and EmptyProducts (which
// assumes an "add your first product" admin flow).
export const PublicProductGrid: React.FC<PublicProductGridProps> = ({
  businessId,
  categories,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  // Por debajo de md (xs+sm) el catálogo usa controles propios en dos filas.
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const initialFilters: FilterValues = {
    search: "",
    categories: [],
    offer: false,
    featured: false,
  };
  const { viewMode, setViewMode } = useCatalogViewMode();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);

  // NOTE: we deliberately do NOT send `search` to the backend as the
  // `name` param. That endpoint (`catalog/`) only filters by *category*
  // name (`ProductCategoryFilter.name`, backend-side) — it has no support
  // for matching a product's own name/description. Sending the search term
  // there was the root cause of "the search bar only finds categories, not
  // products": a product whose name matched but whose category name didn't
  // would never come back from the API at all. So we fetch the
  // (non-text-filtered) categories/products and match the search term
  // against category name AND product name/description client-side below.
  const { data: catalogRaw, isLoading, error } = usePublicCatalog(businessId, {
    has_promotion: filters.offer,
    ...(filters.featured ? { has_featured: true } : {}),
    include_counts: true,
    ids: filters.categories.map((c) => c.id).join(","),
  });

  const catalog = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    if (!catalogRaw || !searchTerm) {
      return catalogRaw;
    }

    const filteredResults = catalogRaw.results
      .map((category: CategoryWithProducts) => {
        const categoryMatches = category.name
          ?.toLowerCase()
          .includes(searchTerm);
        if (categoryMatches) return category;

        const matchingProducts = (category.products || []).filter(
          (product) =>
            product.name?.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm),
        );
        if (matchingProducts.length === 0) return null;
        return { ...category, products: matchingProducts };
      })
      .filter((category): category is CategoryWithProducts => !!category);

    const productsCount = filteredResults.reduce(
      (sum, category) => sum + category.products.length,
      0,
    );

    return {
      ...catalogRaw,
      results: filteredResults,
      products_count: productsCount,
    };
  }, [catalogRaw, filters.search]);

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const filterCounts = useRetainedFilterCounts(
    catalogRaw?.filter_counts,
    businessId,
  );
  const results = catalog?.results ?? [];
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.categories.length > 0 ||
    filters.offer ||
    filters.featured;
  const showError = !isLoading && !!error;
  const showEmptyState = !isLoading && !error && results.length === 0;

  return (
    <Box sx={{ px: { xs: 0, md: 8 }, pt: 0, pb: 2 }}>
      {/* Los controles (filtros y Compartir/QR) siempre se muestran: los
          estados vacío/error reemplazan solo el área de resultados, así el
          usuario puede quitar un filtro activo o volver a "Todo". */}
      <Box mb={4}>
        {isBelowMd ? (
          <PublicMobileCatalogControls
            values={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filterCounts={filterCounts}
          />
        ) : (
          <FilterSection
            values={filters}
            onFilterChange={handleFilterChange}
            setOpenCategoryModal={() => setOpenCategoryModal(true)}
            categories={categories}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showViewToggleOnMobile
            filterCounts={filterCounts}
          />
        )}
      </Box>
      <CategoryFilterModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        initialSelectedCategories={filters.categories}
        onSubmit={(selected) => handleFilterChange({ categories: selected })}
        categories={categories}
      />
      {isLoading && <LoadingSpinner />}
      {showError && (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">
            Error al cargar los productos.
          </Typography>
        </Box>
      )}
      {showEmptyState && (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">
            {hasActiveFilters
              ? "No encontramos productos con estos filtros."
              : "Este negocio aún no tiene productos."}
          </Typography>
        </Box>
      )}
      {!isLoading &&
        !error &&
        !showEmptyState &&
        results.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            viewMode={viewMode}
            readOnly
            stickyTopOffset={0}
            onProductClick={(product) =>
              navigate(
                getPublicProductPath({
                  businessId,
                  categorySlug: product.categorySlug,
                  productSlug: product.slug,
                  productId: product.id,
                }),
              )
            }
          />
        ))}
    </Box>
  );
};

export default PublicProductGrid;
