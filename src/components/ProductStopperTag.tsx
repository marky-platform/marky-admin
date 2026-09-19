import React from "react";
import { Box } from "@mui/material";

interface ProductStopperTagProps {
  stopper?: string | null;
}

const ProductStopperTag: React.FC<ProductStopperTagProps> = ({ stopper }) => {
  if (!stopper) return null;

  const isFavorite = stopper === "FAVORITE";
  const isRecommended = stopper === "RECOMMENDED";
  if (!isFavorite && !isRecommended) return null;

  const label = isFavorite ? "Favorito del mes" : "Recomendado";
  const bg = isFavorite ? "#FFD401" : "primary.main";
  const color = isFavorite ? "#333" : "#FFF";

  return (
    <Box
      sx={{
        width: "fit-content",
        backgroundColor: bg,
        color,
        fontWeight: 500,
        fontSize: "0.875rem",
        lineHeight: "28px",
        position: "relative",
        borderRight: "20px solid transparent",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        pl: 2,
        mb: 2,
        clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0% 100%)",
      }}
    >
      {label}
    </Box>
  );
};

export default ProductStopperTag;
