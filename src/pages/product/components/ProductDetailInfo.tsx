import { Box, Typography } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";
import ProductStopperTag from "../../../components/ProductStopperTag";
import ProductActionsMenu from "../../../components/ProductActionsMenu";
import InfoPill, { InfoPillList } from "./InfoPill";
import ProductDetailSpecs from "./ProductDetailSpecs";

const ProductDetailInfo: React.FC<{ product: Product; readOnly?: boolean }> = ({
  product,
  readOnly = false,
}) => {
  const isAvailable = product.is_available ?? product.is_active ?? true;

  const ingredients = product.featuredIngredients ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Encabezado + cantidad/tamaño/rendimiento (grupo de 8px) */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
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

        <ProductDetailSpecs product={product} />
      </Box>

      {product.description && (
        <Box mt={0}>
          <Typography color="text.secondary">{product.description}</Typography>
        </Box>
      )}

      {ingredients.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" sx={{ lineHeight: "18px" }}>
            Ingredientes principales:
          </Typography>
          <InfoPillList label="Ingredientes principales">
            {ingredients.map((ingredient, index) => (
              <InfoPill key={`${index}-${ingredient}`} label={ingredient} />
            ))}
          </InfoPillList>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetailInfo;
