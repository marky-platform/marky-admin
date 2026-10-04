import { Box, Typography } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";
import { getPresentationRows } from "../../../utils/productDetailFormat";

// Cantidad / tamaño / rendimiento bajo la fila de stopper + categoría.
// Cada fila se oculta si su dato falta; sin filas no renderiza nada.
const ProductDetailSpecs: React.FC<{ product: Product }> = ({ product }) => {
  const rows = getPresentationRows(product.presentation);
  if (rows.length === 0) return null;

  return (
    <Box component="dl" sx={{ m: 0 }}>
      {rows.map(({ label, value }) => (
        <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            component="dt"
            variant="caption"
            fontWeight={500}
            color="text.secondary"
          >
            {label}:
          </Typography>
          <Typography
            component="dd"
            variant="caption"
            fontWeight={500}
            color="primary.main"
            sx={{ m: 0 }}
          >
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default ProductDetailSpecs;
