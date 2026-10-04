import { Box, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import categoryIcons from "../../../assets/icons/category/categoryIcons";
import { ReactComponent as CrownIcon } from "../../../assets/icons/crown.svg";
import ProductCard from "../../../components/ProductCard";
import useRelatedProducts from "../../../hooks/useRelatedProducts";
import { ROUTES } from "../../../routes/paths";
import { Product } from "../../../types/product";

interface RelatedProductsProps {
  product: Product;
  /** Present only on the public page; selects the anonymous catalog and the
   * public product route. */
  businessId?: string;
}

// "Productos en <categoría>": otros productos de la misma categoría. Se oculta
// si el producto no tiene categoría o no hay más productos que mostrar.
const RelatedProducts: React.FC<RelatedProductsProps> = ({
  product,
  businessId,
}) => {
  const navigate = useNavigate();
  const { category, products } = useRelatedProducts(product, businessId);

  if (!category || products.length === 0) return null;

  const goToProduct = (productId: string | number) =>
    navigate(
      businessId
        ? `/${businessId}/product/${productId}`
        : ROUTES.PRODUCT_DETAIL.replace(":id", String(productId)),
    );

  const CategoryIcon =
    (category.icon && categoryIcons[category.icon]) || CrownIcon;

  return (
    <Box component="section" aria-labelledby="related-products-title">
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
        <Box
          sx={{
            bgcolor: "grey.200",
            borderRadius: 1.5,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CategoryIcon fontSize="small" />
        </Box>
        <Typography
          id="related-products-title"
          variant="h3"
          fontWeight={500}
          color="text.secondary"
        >
          Productos en {category.name}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
          gap: 0,
        }}
      >
        {products.map((related) => (
          // ProductCard is a clickable div; this wrapper makes each card
          // reachable and activatable (Enter) from the keyboard.
          <Box
            key={related.id}
            role="link"
            tabIndex={0}
            aria-label={related.name}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                event.target === event.currentTarget
              ) {
                event.preventDefault();
                goToProduct(related.id);
              }
            }}
            sx={{
              borderRadius: { xs: 3, md: "22px" },
              "&:focus-visible": {
                outline: "2px solid",
                outlineColor: "primary.main",
              },
            }}
          >
            <ProductCard
              product={related}
              readOnly
              onClick={() => goToProduct(related.id)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RelatedProducts;
