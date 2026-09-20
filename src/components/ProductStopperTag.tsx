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
        fontSize: { xs: 12, md: "0.875rem" },
        lineHeight: "28px",
        position: "relative",
        // Mobile: the clipPath alone cuts the ribbon's pointed right edge —
        // no borderRight/borderTopRightRadius, which would otherwise double
        // the tip width. Desktop restores the prior geometry, which combined
        // a transparent border with a matching clipPath.
        borderTopLeftRadius: { xs: "15px", md: 8 },
        borderBottomLeftRadius: { xs: "15px", md: 8 },
        borderTopRightRadius: { xs: 0, md: 8 },
        borderRight: { xs: "none", md: "20px solid transparent" },
        paddingLeft: { xs: "6px", md: 2 },
        paddingRight: { xs: "17px", md: 0 },
        mb: 2,
        clipPath: {
          xs: "polygon(0px 0px, 100% 0px, calc(100% - 11px) 100%, 0% 100%)",
          md: "polygon(0 0, calc(100% - 20px) 0, 100% 100%, 0% 100%)",
        },
      }}
    >
      {label}
    </Box>
  );
};

export default ProductStopperTag;
