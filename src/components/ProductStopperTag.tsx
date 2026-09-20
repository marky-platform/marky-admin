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
        fontSize: 12,
        lineHeight: "28px",
        position: "relative",
        // The clipPath below is the single mechanism that cuts the ribbon's
        // pointed right edge — no borderRight/borderTopRightRadius, which
        // would otherwise double the tip width.
        borderTopLeftRadius: "15px",
        borderBottomLeftRadius: "15px",
        paddingLeft: "6px",
        paddingRight: "17px",
        mb: 2,
        clipPath:
          "polygon(0px 0px, 100% 0px, calc(100% - 11px) 100%, 0% 100%)",
      }}
    >
      {label}
    </Box>
  );
};

export default ProductStopperTag;
