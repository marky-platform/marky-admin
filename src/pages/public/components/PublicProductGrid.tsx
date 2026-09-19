import { Box, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryGroup from "../../../components/CategoryGroup";
import LoadingSpinner from "../../../components/LoadingSpinner";
import usePublicCatalog from "../../../hooks/usePublicCatalog";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import CategoryFilterModal, {
  Category,
} from "../../home/components/CategoryFilterModal";
import FilterSection from "../../home/components/FilterSection";

interface FilterValues {
  search: string;
  categories: Category[];
  offer: boolean;
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
  const initialFilters: FilterValues = {
    search: "",
    categories: [],
    offer: false,
  };
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

  if (error) {
    return <Typography>Error al cargar los productos.</Typography>;
  }

  const results = catalog?.results ?? [];
  const showEmptyState = !isLoading && results.length === 0;

  return (
    <Box sx={{ px: { xs: 0, md: 8 }, pt: 0, pb: 2 }}>
      {!showEmptyState && (
        <Box mb={4}>
          <FilterSection
            values={filters}
            onFilterChange={handleFilterChange}
            setOpenCategoryModal={() => setOpenCategoryModal(true)}
            categories={categories}
          />
        </Box>
      )}
      <CategoryFilterModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        initialSelectedCategories={filters.categories}
        onSubmit={(selected) => handleFilterChange({ categories: selected })}
        categories={categories}
      />
      {isLoading && <LoadingSpinner />}
      {!isLoading && showEmptyState && (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary">
            Este negocio aún no tiene productos.
          </Typography>
        </Box>
      )}
      {!isLoading &&
        !showEmptyState &&
        results.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            readOnly
            stickyTopOffset={0}
            onProductClick={(product) =>
              navigate(`/${businessId}/product/${product.id}`)
            }
          />
        ))}
    </Box>
  );
};

export default PublicProductGrid;
