import { Box, Typography } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";
import InfoPill, { InfoPillList } from "./InfoPill";

const ProductDetailIngredients: React.FC<{ product: Product }> = ({
  product,
}) => {
  const ingredients = product.featuredIngredients ?? [];
  if (ingredients.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" fontWeight={700} sx={{ lineHeight: "22px" }}>
        Ingredientes principales
      </Typography>
      <InfoPillList label="Ingredientes principales">
        {ingredients.map((ingredient, index) => (
          <InfoPill key={`${index}-${ingredient}`} label={ingredient} large />
        ))}
      </InfoPillList>
    </Box>
  );
};

export default ProductDetailIngredients;
