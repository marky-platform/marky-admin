import { Box, Grid } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";
import ProductAddonsList from "./ProductAddonsList";
import ProductDetailGallery from "./ProductDetailGallery";
import ProductDetailInfo from "./ProductDetailInfo";
import ProductDetailPricing from "./ProductDetailPricing";
import ProductVariantsList from "./ProductVariantsList";

export const PRODUCT_INFO_MAX_WIDTH = 600;

/**
 * The product-detail body shared by the admin page (ProductDetailPage,
 * wrapped in Header + back row) and the public page (its own chrome + this
 * same content, `readOnly`).
 */
const ProductDetailContent: React.FC<{ product: Product; readOnly?: boolean }> = ({
  product,
  readOnly = false,
}) => {
  return (
    <Grid container spacing={8}>
      {/* COLUMN 1 */}
      <Grid
        item
        xs={12}
        md={4}
        lg={5}
        sx={{ display: "flex", alignItems: "flex-start" }}
      >
        <ProductDetailGallery product={product} />
      </Grid>
      {/* COLUMN 2 */}
      <Grid item xs={12} md={8} lg={7}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxWidth: PRODUCT_INFO_MAX_WIDTH,
          }}
        >
          <Box>
            <ProductDetailInfo product={product} readOnly={readOnly} />

            <ProductDetailPricing product={product} />
          </Box>

          {product.variants.length > 0 && (
            <ProductVariantsList variants={product.variants} />
          )}
          {product.addons.length > 0 && (
            <ProductAddonsList addons={product.addons} />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default ProductDetailContent;
