import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React from "react";
import { Product } from "../../../types/product";
import ProductStopperTag from "../../../components/ProductStopperTag";
import ProductActionsMenu from "../../../components/ProductActionsMenu";

// Disponibilidad, nombre + acciones, stopper y categoría.
const ProductDetailHeader: React.FC<{
  product: Product;
  readOnly?: boolean;
  sx?: SxProps<Theme>;
}> = ({ product, readOnly = false, sx }) => {
  const isAvailable = product.is_available ?? product.is_active ?? true;

  return (
    <Box sx={sx}>
      {/* Disponibilidad (punto + texto) */}
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: isAvailable ? "success.main" : "grey.500",
          }}
        />
        <Typography variant="body1" fontWeight={400}>
          {isAvailable ? "Disponible" : "No disponible"}
        </Typography>
      </Box>

      {/* Nombre del producto + menú de acciones */}
      <Box display="flex" alignItems="flex-start" gap={2} sx={{ mb: 1 }}>
        <Typography
          variant="h2"
          fontWeight={700}
          color="text.primary"
          sx={{
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>
        {!readOnly && (
          <ProductActionsMenu
            product={product}
            triggerSx={{
              backgroundColor: "grey.400",
              borderRadius: 1.5,
              p: 2,
            }}
          />
        )}
      </Box>

      {/* Stopper + categoría en la misma fila */}
      <Box display="flex" alignItems="center" gap={2}>
        <ProductStopperTag stopper={product.stopper} />

        {product.category && (
          <Typography variant="body2" color="text.secondary">
            en categoría:{" "}
            <Box component="span" color="primary.main">
              {product.category.name}
            </Box>
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetailHeader;
