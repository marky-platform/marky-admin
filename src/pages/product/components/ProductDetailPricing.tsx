import { Box, Typography } from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import React, { useMemo } from "react";
import { Product } from "../../../types/product";
import { formatPrice } from "../../../utils/format";

// Figma specifies a bolder/tighter H2 for the price than the app's shared
// global h2 (also used e.g. for the product name). Scoped via a nested theme
// so other h2 consumers on this page are unaffected — same pattern as
// AuthLayout.tsx's applyAuthTypography.
const applyPriceTypography = (outerTheme: Theme) =>
  createTheme(outerTheme, {
    typography: {
      h2: { fontWeight: 700, lineHeight: "32px", letterSpacing: "-0.096px" },
    },
  });

const ProductDetailPricing: React.FC<{ product: Product }> = ({ product }) => {
  const outerTheme = useTheme();
  const priceTheme = useMemo(
    () => applyPriceTypography(outerTheme),
    [outerTheme]
  );
  const discount = Number(product.discountPercentage ?? 0);

  // Treat presence of backend "with discount" labels as signal too
  const hasDiscount =
    discount > 0 ||
    !!product.primaryPriceWithDiscount ||
    !!product.secondaryPriceWithDiscount;

  // Fallback computed prices in case backend doesn't provide formatted labels
  const originalPriceComputed = formatPrice(product.price ?? 0);
  const discountedPriceNumber =
    discount > 0
      ? Number(product.price) * (1 - discount / 100)
      : Number(product.price);
  const discountedPriceComputed = formatPrice(discountedPriceNumber);

  // Prefer backend formatted labels when available
  const primaryDiscountedToShow =
    product.primaryPriceWithDiscount ??
    product.primaryPrice ??
    (hasDiscount ? discountedPriceComputed : undefined);
  const primaryOriginalToShow = product.primaryPrice ?? originalPriceComputed;

  const secondaryDiscountedToShow =
    product.secondaryPriceWithDiscount ?? product.secondaryPrice ?? undefined;
  const secondaryOriginalToShow = product.secondaryPrice ?? undefined;

  return (
    <ThemeProvider theme={priceTheme}>
      <Box sx={{ mt: 8 }}>
        {hasDiscount ? (
          <Box display="flex" flexDirection="column" gap={0.5}>
            {primaryDiscountedToShow && (
              <Typography color="primary" variant="h2">
                {primaryDiscountedToShow}
              </Typography>
            )}

            {primaryOriginalToShow && (
              <Typography
                variant="body2"
                fontWeight={500}
                fontSize={"medium"}
                color="primary"
                sx={{ textDecoration: "line-through" }}
              >
                {primaryOriginalToShow}
              </Typography>
            )}

            {secondaryDiscountedToShow && (
              <Typography variant="body2" color="grey.500">
                {secondaryDiscountedToShow}
              </Typography>
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography color="primary" variant="h2">
              {primaryOriginalToShow}
            </Typography>

            {secondaryOriginalToShow && (
              <Typography variant="body2" color="text.secondary">
                {secondaryOriginalToShow}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default ProductDetailPricing;
