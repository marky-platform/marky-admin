import { Box, Typography } from "@mui/material";
import React from "react";

type ProductPromotionBadgeProps =
  | { kind: "discount"; value: number }
  | { kind: "multibuy"; value: string };

// Muestra "-15%" sin ceros decimales sobrantes (15, no 15.00).
const formatDiscount = (value: number) =>
  Number.isInteger(value)
    ? value.toString()
    : parseFloat(value.toFixed(2)).toString();

/**
 * Pill de promoción (descuento o multicompra "2x1"/"3x2") compartida por la
 * tarjeta de producto y la galería del detalle. Solo define forma, tipografía
 * y colores; el posicionamiento lo decide cada superficie que la consume.
 */
const ProductPromotionBadge: React.FC<ProductPromotionBadgeProps> = (props) => (
  <Box
    component="span"
    data-testid="product-badge"
    sx={{
      bgcolor: props.kind === "discount" ? "error.main" : "primary.main",
      color: "fixed.white",
      px: 2,
      py: 1,
      borderRadius: "24px",
      display: "inline-block",
    }}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 500, fontSize: 14, color: "fixed.white" }}
    >
      {props.kind === "discount"
        ? `-${formatDiscount(props.value)}%`
        : props.value}
    </Typography>
  </Box>
);

export default ProductPromotionBadge;
