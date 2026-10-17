import { Typography } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";

const ProductDetailDescription: React.FC<{ product: Product }> = ({
  product,
}) => {
  if (!product.description) return null;

  return <Typography color="text.secondary">{product.description}</Typography>;
};

export default ProductDetailDescription;
