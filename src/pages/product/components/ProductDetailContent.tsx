import { Box } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";
import ProductAddonsList from "./ProductAddonsList";
import ProductDetailGallery from "./ProductDetailGallery";
import ProductDetailInfo from "./ProductDetailInfo";
import ProductDetailPricing from "./ProductDetailPricing";
import ProductVariantsList from "./ProductVariantsList";

export const PRODUCT_INFO_MAX_WIDTH = 600;
export const PRODUCT_PAGE_MAX_WIDTH = 1200;

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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
        columnGap: { xs: 0, md: "40px" },
        rowGap: 8,
      }}
    >
      {/* COLUMN 1 */}
      <Box sx={{ display: "flex", alignItems: "flex-start", minWidth: 0 }}>
        <ProductDetailGallery product={product} />
      </Box>
      {/* COLUMN 2 */}
      <Box sx={{ minWidth: 0 }}>
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
      </Box>
    </Box>
  );
};

export default ProductDetailContent;
