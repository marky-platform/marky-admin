import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React from "react";
import { Product } from "../../../types/product";
import { getPresentationRows } from "../../../utils/productDetailFormat";

// Cantidad / tamaño / rendimiento del diseño: caja con borde y una celda por
// dato. md+: celdas en columnas (término arriba, valor abajo); xs/sm: una fila
// por dato (término a la izquierda, valor a la derecha). Cada fila se oculta
// si su dato falta; sin filas no renderiza nada.
const ProductDetailSpecs: React.FC<{
  product: Product;
  sx?: SxProps<Theme>;
}> = ({ product, sx }) => {
  const rows = getPresentationRows(product.presentation);
  if (rows.length === 0) return null;

  return (
    <Box
      data-testid="product-detail-specs"
      sx={[
        { display: "flex", flexDirection: "column", gap: 2 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography variant="body2" component="h3" fontWeight={700}>
        Detalles
      </Typography>
      <Box
        component="dl"
        data-testid="product-detail-spec-list"
        sx={{
          m: 0,
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: `repeat(${rows.length}, minmax(0, 1fr))`,
          },
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {rows.map(({ label, value }) => (
          <Box
            key={label}
            data-testid="product-detail-spec"
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              alignItems: { xs: "center", md: "flex-start" },
              justifyContent: { xs: "space-between", md: "flex-start" },
              gap: { xs: 4, md: 0.5 },
              px: 4,
              py: 3,
              borderColor: "divider",
              borderStyle: "solid",
              borderWidth: 0,
              // xs/sm: separador entre filas. md+: separador entre columnas.
              "&:not(:last-of-type)": {
                borderBottomWidth: { xs: "1px", md: 0 },
                borderRightWidth: { xs: 0, md: "1px" },
              },
            }}
          >
            <Typography
              component="dt"
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: "16px" }}
            >
              {label}
            </Typography>
            <Typography
              component="dd"
              variant="body2"
              color="text.primary"
              sx={{
                m: 0,
                fontWeight: 500,
                textAlign: { xs: "right", md: "left" },
              }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProductDetailSpecs;
