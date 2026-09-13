import AppsIcon from "@mui/icons-material/Apps";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import { Box, Button, Typography } from "@mui/material";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DeleteCategoryWarningImage from "../../../assets/images/delete-category-warning.png";
import useDeleteProductCategory from "../../../hooks/useDeleteProductCategory";
import useDeleteProduct from "../../../hooks/useDeleteProduct";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/paths";
import CategoryGroup from "../../../components/CategoryGroup";
import useUpdateProductCategoryAvailability from "../../../hooks/useUpdateProductCategoryAvailability";
import LoadingSpinner from "../../../components/LoadingSpinner";
import useProductCategoriesWithProducts from "../../../hooks/useProductCategoriesWithProducts";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import CategoryAdminModal from "./CategoryAdminModal";
import CategoryPromotionModal from "../../../components/CategoryPromotionModal";
import ProductPromotionModal from "../../../components/ProductPromotionModal";
import MoveToCategoryModal, {
  MoveToCategoryModalCurrentCategory,
} from "../../product/components/MoveToCategoryModal";
import CategoryFilterModal, { Category } from "./CategoryFilterModal";
import FilterSection from "./FilterSection";
import EmptyProducts from "./EmptyProducts";
import { useHomePageData } from "../../../hooks/useHomePageData";

interface FilterValues {
  search: string;
  categories: Category[];
  offer: boolean;
}

export const ProductGrid: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const initialFilters: FilterValues = {
    search: "",
    categories: [],
    offer: false,
  };

  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [hasFiltered, setHasFiltered] = useState(false);

  // `filters.search` already arrives debounced from FilterSection (it only
  // propagates the value up once the user pauses typing), so no extra
  // debouncing is needed here.
  //
  // NOTE: we deliberately do NOT send `search` to the backend as the
  // `name` param. That endpoint (`with_products`) only filters by
  // *category* name (`ProductCategoryFilter.name`, backend-side) — it has
  // no support for matching a product's own name/description. Sending the
  // search term there was the root cause of "the search bar only finds
  // categories, not products": a product whose name matched but whose
  // category name didn't would never come back from the API at all. So we
  // fetch the (non-text-filtered) categories/products and match the search
  // term against category name AND product name/description client-side
  // below.
  const {
    data: categoriesWithProductsRaw,
    isLoading,
    error,
  } = useProductCategoriesWithProducts({
    has_promotion: filters.offer,
    ids: filters.categories.map((c) => c.id).join(","),
  });

  const categoriesWithProducts = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    if (!categoriesWithProductsRaw || !searchTerm) {
      return categoriesWithProductsRaw;
    }

    const filteredResults = categoriesWithProductsRaw.results
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
      ...categoriesWithProductsRaw,
      results: filteredResults,
      products_count: productsCount,
    };
  }, [categoriesWithProductsRaw, filters.search]);

  const productCount = categoriesWithProducts?.products_count || 0;
  const categoriesCount = categoriesWithProducts?.results.length || 0;
  const { data: homePageData } = useHomePageData();
  // The fully-empty illustration is only for a business with no categories
  // at all yet. Once a category exists (even with zero products), it must
  // render in the grid with its own "Añade tu producto" empty-state tile
  // (see CategoryGroup) instead of the whole-page empty state — a product
  // count of 0 alone isn't enough to trigger it.
  const showEmptyState = !hasFiltered && !isLoading && categoriesCount === 0;

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openCategoryAdminModal, setOpenCategoryAdminModal] = useState(false);
  const [openPromotionModal, setOpenPromotionModal] = useState(false);
  const [selectedPromotionCategory, setSelectedPromotionCategory] =
    useState<any>(null);

  const location = useLocation();

  // Preselect and open the category promotion modal when arriving via a
  // notification's "?promoCategory=<id>" deep link (category-expiry
  // notification, products/services.py::handle_expired_promotions_for_business).
  // Mirrors the ?section= pattern in ProductFormPage.tsx.
  useEffect(() => {
    const promoCategoryId = new URLSearchParams(location.search).get(
      "promoCategory",
    );
    if (!promoCategoryId || !categoriesWithProductsRaw) return;
    const target = categoriesWithProductsRaw.results.find(
      (c: CategoryWithProducts) => String(c.id) === promoCategoryId,
    );
    if (target) {
      setSelectedPromotionCategory(target);
      setOpenPromotionModal(true);
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesWithProductsRaw, location.search]);

  const [openProductPromotionModal, setOpenProductPromotionModal] =
    useState(false);
  const [selectedPromotionProduct, setSelectedPromotionProduct] =
    useState<any>(null);
  const [openMoveModal, setOpenMoveModal] = useState(false);
  const [selectedMoveProduct, setSelectedMoveProduct] = useState<any>(null);
  const [selectedMoveCurrentCategory, setSelectedMoveCurrentCategory] =
    useState<MoveToCategoryModalCurrentCategory | null>(null);
  const deleteCategoryMutation = useDeleteProductCategory();
  const updateCategoryAvailability = useUpdateProductCategoryAvailability();
  const [openDeleteCategoryDialog, setOpenDeleteCategoryDialog] =
    useState(false);
  const [selectedCategoryToDelete, setSelectedCategoryToDelete] =
    useState<any>(null);
  const isDeletingCategory = deleteCategoryMutation.isPending;

  const deleteProductMutation = useDeleteProduct();
  const [openDeleteProductDialog, setOpenDeleteProductDialog] =
    useState(false);
  const [selectedProductToDelete, setSelectedProductToDelete] =
    useState<any>(null);
  const isDeletingProduct = deleteProductMutation.isPending;

  const handleFilterChange = (newFilters: Partial<FilterValues>) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, ...newFilters };
      const isFiltering =
        updatedFilters.search !== "" ||
        updatedFilters.categories.length > 0 ||
        updatedFilters.offer;
      setHasFiltered(isFiltering);
      return updatedFilters;
    });
  };

  if (error) {
    return <Typography>Error loading products.</Typography>;
  }

  return (
    <Box sx={{ px: { xs: 0, md: 8 }, pt: 0, pb: 2 }}>
      <Box
        mb={4}
        sx={{
          boxShadow: "0px 1px 0px 0px #E8E9EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 3,
        }}
      >
        <Typography variant="h2" sx={{ display: { xs: "none", md: "block" } }}>
          Productos
        </Typography>
        <Box
          display={"flex"}
          sx={{
            width: { xs: "100%", md: "auto" },
            gap: { xs: "18px", md: 3 },
          }}
        >
          <Button
            onClick={() => setOpenCategoryAdminModal(true)}
            variant="grey1"
            sx={{
              flex: { xs: "1 1 0", md: "0 0 auto" },
              minWidth: 0,
              padding: "8px 12px 8px 12px",
              color: "#4B4B4B",
              boxShadow: 0,
            }}
            startIcon={<AppsIcon />}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Administrar Categorías
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
              Categorías
            </Box>
          </Button>
          <Button
            startIcon={<LocalCafeIcon />}
            variant="contained"
            color="primary"
            onClick={() => navigate(ROUTES.PRODUCT_CREATE)}
            sx={{
              flex: { xs: "1 1 0", md: "0 0 auto" },
              minWidth: 0,
              padding: "8px 12px 8px 12px",
              boxShadow: 0,
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
              Agregar Producto
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
              Producto
            </Box>
          </Button>
        </Box>
      </Box>
      {/* Filtros: Search y selects */}
      {!showEmptyState && (
        <Box mb={2}>
          <FilterSection
            values={filters}
            onFilterChange={handleFilterChange}
            setOpenCategoryModal={() => setOpenCategoryModal(true)}
          />
          {hasFiltered && (
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", md: "block" },
                mt: 2,
                textAlign: "left",
              }}
            >
              {productCount === 0
                ? "No se han encontrado productos"
                : `Encontramos ${productCount} productos`}
            </Typography>
          )}
        </Box>
      )}
      {/* Modal de filtrado de categorías */}
      <Box>
        <CategoryFilterModal
          open={openCategoryModal}
          onClose={() => setOpenCategoryModal(false)}
          initialSelectedCategories={filters.categories}
          onSubmit={(categories: Category[]) => {
            handleFilterChange({ categories });
          }}
        />
        <CategoryAdminModal
          open={openCategoryAdminModal}
          onClose={(orderChanged) => {
            setOpenCategoryAdminModal(false);
            if (orderChanged) {
              queryClient.invalidateQueries({
                queryKey: ["productCategoriesWithProducts"],
              });
            }
          }}
        />
      </Box>
      {/* Cuadrícula de productos */}
      {isLoading && <LoadingSpinner />}
      {!isLoading && showEmptyState && (
        <EmptyProducts businessName={homePageData?.business_name} />
      )}
      {!isLoading && !showEmptyState && categoriesWithProducts?.results.map((cat) => (
        <CategoryGroup
          key={cat.id}
          category={cat}
          onPromotionClick={(c) => {
            setSelectedPromotionCategory(c);
            setOpenPromotionModal(true);
          }}
          onDeleteCategory={() => {
            setSelectedCategoryToDelete(cat);
            setOpenDeleteCategoryDialog(true);
          }}
          onToggleAvailability={(checked) => {
            const newIsAvailable = !checked; // checked === true means "No disponible" => is_available = false

            // Optimistic local update handled inside CategoryGroup; trigger backend update
            updateCategoryAvailability.mutate({
              id: cat.id,
              is_available: newIsAvailable,
            });
          }}
          onProductPromotionClick={(product) => {
            setSelectedPromotionProduct(product);
            setOpenProductPromotionModal(true);
          }}
          onProductDeleteClick={(product) => {
            setSelectedProductToDelete(product);
            setOpenDeleteProductDialog(true);
          }}
          onProductMoveClick={(product, currentCategory) => {
            setSelectedMoveProduct(product);
            setSelectedMoveCurrentCategory(currentCategory);
            setOpenMoveModal(true);
          }}
        />
      ))}
      <ConfirmationDialog
        open={Boolean(openDeleteCategoryDialog)}
        title="¿Estás seguro de eliminar esta categoría?"
        content="Esta acción también eliminará permanentemente los productos vinculados."
        image={DeleteCategoryWarningImage}
        confirmationCheckboxLabel="Confirmo que deseo eliminar la categoría"
        confirmColor="error"
        confirmText="Eliminar"
        onClose={() => {
          if (!isDeletingCategory) {
            setOpenDeleteCategoryDialog(false);
            setSelectedCategoryToDelete(null);
          }
        }}
        onConfirm={() => {
          if (!selectedCategoryToDelete) return;
          deleteCategoryMutation.mutate(selectedCategoryToDelete.id, {
            onSuccess: () => {
              setOpenDeleteCategoryDialog(false);
              setSelectedCategoryToDelete(null);
            },
            onError: () => {
              setOpenDeleteCategoryDialog(false);
            },
          });
        }}
        isLoading={Boolean(isDeletingCategory)}
      />
      <ConfirmationDialog
        open={Boolean(openDeleteProductDialog)}
        title="¿Estás seguro de eliminar este producto?"
        content="Esta acción eliminará permanentemente el producto."
        image={selectedProductToDelete?.image || undefined}
        imageOverlay={
          <ReportProblemIcon color="error" sx={{ fontSize: 28 }} />
        }
        confirmationCheckboxLabel="Confirmo que deseo eliminar el producto"
        confirmColor="error"
        confirmText="Eliminar"
        onClose={() => {
          if (!isDeletingProduct) {
            setOpenDeleteProductDialog(false);
            setSelectedProductToDelete(null);
          }
        }}
        onConfirm={() => {
          if (!selectedProductToDelete) return;
          deleteProductMutation.mutate(Number(selectedProductToDelete.id), {
            onSuccess: () => {
              setOpenDeleteProductDialog(false);
              setSelectedProductToDelete(null);
            },
            onError: () => {
              setOpenDeleteProductDialog(false);
            },
          });
        }}
        isLoading={Boolean(isDeletingProduct)}
      />
      <CategoryPromotionModal
        open={openPromotionModal}
        category={selectedPromotionCategory}
        onClose={() => {
          setOpenPromotionModal(false);
          setSelectedPromotionCategory(null);
        }}
      />
      <ProductPromotionModal
        open={openProductPromotionModal}
        product={selectedPromotionProduct}
        onClose={() => {
          setOpenProductPromotionModal(false);
          setSelectedPromotionProduct(null);
        }}
      />
      <MoveToCategoryModal
        open={openMoveModal}
        product={selectedMoveProduct}
        currentCategory={selectedMoveCurrentCategory}
        onClose={() => {
          setOpenMoveModal(false);
          setSelectedMoveProduct(null);
          setSelectedMoveCurrentCategory(null);
        }}
      />
    </Box>
  );
};
