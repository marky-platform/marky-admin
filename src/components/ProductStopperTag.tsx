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
        lineHeight: { xs: "24px", md: "28px" },
        position: "relative",
        // Favorite/Recommended share identical geometry at each breakpoint,
        // differing only in text/colors. The transparent border reserves
        // space for the angled tip that the matching clip-path then cuts,
        // so the two must stay in sync or the tip doubles/oversizes.
        borderTopLeftRadius: "15px",
        borderBottomLeftRadius: "15px",
        borderTopRightRadius: 0,
        borderRight: { xs: "12px solid transparent", md: "16px solid transparent" },
        paddingLeft: { xs: "6px", md: "8px" },
        paddingRight: 0,
        mb: 2,
        clipPath: "polygon(0px 0px, 100% 0px, calc(100% - 11px) 100%, 0% 100%)",
      }}
    >
      {label}
    </Box>
  );
};

export default ProductStopperTag;
