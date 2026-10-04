import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProductStopperTag from "../../../components/ProductStopperTag";
import SortableList from "../../../components/SortableList";
import XButton from "../../../components/XButton";
import useProductCategoriesWithProducts from "../../../hooks/useProductCategoriesWithProducts";
import useUpdateProductCategoryProductsOrder from "../../../hooks/useUpdateProductCategoryProductsOrder";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import { ProductGridItem } from "../../../types/product";
import {
  buildProductOrderPayload,
  splitByPlacement,
} from "../../../utils/productOrder";

interface ProductOrderModalProps {
  open: boolean;
  /** Categoría cuyos productos se ordenan; `null` mientras no hay selección. */
  category: Pick<CategoryWithProducts, "id" | "name"> | null;
  onClose: () => void;
}

const THUMBNAIL_SIZE = 40;

const ProductThumbnail: React.FC<{ product: ProductGridItem }> = ({
  product,
}) => (
  <Box
    sx={{
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      flexShrink: 0,
      borderRadius: 1.5,
      overflow: "hidden",
      backgroundColor: "grey.200",
    }}
  >
    {product.image && (
      <Box
        component="img"
        src={product.image}
        alt=""
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    )}
  </Box>
);

const ProductRow: React.FC<{
  product: ProductGridItem;
  draggable?: boolean;
}> = ({ product, draggable = true }) => (
  <Box
    display="flex"
    alignItems="center"
    gap={1.5}
    minHeight={56}
    pl={1.5}
    pr={3}
  >
    {draggable && <DragIndicatorIcon sx={{ color: "#757575" }} />}
    <ProductThumbnail product={product} />
    <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
      {product.name}
    </Typography>
  </Box>
);

const ProductOrderModal: React.FC<ProductOrderModalProps> = ({
  open,
  category,
  onClose,
}) => {
  const categoryId = category?.id;
  const { data, isLoading, isError } = useProductCategoriesWithProducts(
    { ids: String(categoryId) },
    { enabled: open && categoryId != null, refetchOnMount: "always" },
  );
  const updateOrder = useUpdateProductCategoryProductsOrder();

  // The response can also append the synthetic "Sin categoría" bucket.
  const products = useMemo(
    () => data?.results.find((c) => c.id === categoryId)?.products ?? [],
    [data, categoryId],
  );
  const { pinned, sortable } = useMemo(
    () => splitByPlacement(products),
    [products],
  );

  const handleSave = (orderedSortable: ProductGridItem[]) => {
    if (categoryId == null) return;
    updateOrder.mutate(
      {
        categoryId,
        productIds: buildProductOrderPayload(pinned, orderedSortable),
      },
      { onSuccess: onClose },
    );
  };

  const renderBody = () => {
    if (isLoading) return <LoadingSpinner />;
    if (isError) {
      return (
        <Typography color="error" variant="body2">
          No se pudieron cargar los productos. Inténtalo de nuevo.
        </Typography>
      );
    }
    if (products.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          Esta categoría no tiene productos.
        </Typography>
      );
    }

    return (
      <SortableList
        // Remount if a refetch (the modal always refetches on open) brings a
        // different server order than the cached data it first rendered.
        key={sortable.map((product) => product.id).join(",")}
        items={sortable}
        hint="Selecciona y arrastra el producto"
        renderItem={(product) => <ProductRow product={product} />}
        pinnedContent={
          pinned.length > 0 && (
            <Box sx={{ backgroundColor: "grey.50" }}>
              <Box display="flex" alignItems="center" gap={1} px={1.5} py={1}>
                <LockOutlinedIcon sx={{ fontSize: 16, color: "#757575" }} />
                <Typography variant="caption" color="textSecondary">
                  Los productos destacados siempre aparecen primero
                </Typography>
              </Box>
              {pinned.map((product) => (
                <Box key={product.id} sx={{ boxShadow: "0px 1px 0px #E8E9EB" }}>
                  <Box display="flex" alignItems="center" pr={1.5}>
                    <Box flex={1} minWidth={0}>
                      <ProductRow product={product} draggable={false} />
                    </Box>
                    <Box sx={{ "& > div": { mb: 0 } }}>
                      <ProductStopperTag
                        stopper={
                          product.isFavorite ? "FAVORITE" : "RECOMMENDED"
                        }
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )
        }
        onSave={handleSave}
        isSaving={updateOrder.isPending}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          boxShadow: "0px 1px 0px #E8E9EB",
          p: 3,
        }}
      >
        <DialogTitle
          sx={{ p: 0, fontSize: 16, fontWeight: 500, color: "#292929" }}
        >
          Organizar productos
        </DialogTitle>
        <XButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{ bgcolor: "grey.400", borderRadius: 1.5 }}
        />
      </Box>
      <DialogContent>{renderBody()}</DialogContent>
    </Dialog>
  );
};

export default ProductOrderModal;
