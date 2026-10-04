import { Box } from "@mui/material";
import React from "react";
import { Product } from "../../../types/product";
import ProductAddonsList from "./ProductAddonsList";
import ProductDetailGallery from "./ProductDetailGallery";
import ProductDetailInfo from "./ProductDetailInfo";
import ProductDetailPricing from "./ProductDetailPricing";
import ProductFoodInfo from "./ProductFoodInfo";
import RelatedProducts from "./RelatedProducts";
import ProductVariantsList from "./ProductVariantsList";

export const PRODUCT_INFO_MAX_WIDTH = 600;
export const PRODUCT_PAGE_MAX_WIDTH = 1200;

/**
 * The product-detail body shared by the admin page (ProductDetailPage,
 * wrapped in Header + back row) and the public page (its own chrome + this
 * same content, `readOnly`).
 */
const ProductDetailContent: React.FC<{
  product: Product;
  readOnly?: boolean;
  /** Public page only: selects the anonymous catalog and public routes for
   * the related-products grid. */
  businessId?: string;
}> = ({ product, readOnly = false, businessId }) => {
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <ProductDetailInfo product={product} readOnly={readOnly} />

            <ProductDetailPricing product={product} />
          </Box>

          <ProductFoodInfo product={product} />

          {product.variants.length > 0 && (
            <ProductVariantsList variants={product.variants} />
          )}
          {product.addons.length > 0 && (
            <ProductAddonsList addons={product.addons} />
          )}
        </Box>
      </Box>
      {/* Related products: full width under both columns */}
      <Box sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
        <RelatedProducts product={product} businessId={businessId} />
      </Box>
    </Box>
  );
};

export default ProductDetailContent;
