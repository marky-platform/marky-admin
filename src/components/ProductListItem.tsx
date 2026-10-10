import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Box, Typography } from "@mui/material";
import React from "react";
import defaultImage from "../assets/images/default-product.png";
import { usePromotionCountdown } from "../hooks/usePromotionCountdown";
import { ProductGridItem } from "../types/product";
import { formatPrice } from "../utils/format";
import ProductActionsMenu, { ProductCategoryRef } from "./ProductActionsMenu";
import ProductStopperTag from "./ProductStopperTag";

interface ProductListItemProps {
  product: ProductGridItem;
  currentCategory?: ProductCategoryRef;
  onClick?: () => void;
  onPromotionClick?: (product: ProductGridItem) => void;
  onDeleteClick?: (product: ProductGridItem) => void;
  onMoveClick?: (
    product: ProductGridItem,
    currentCategory?: ProductCategoryRef,
  ) => void;
  /** Vista pública: sin menú de acciones de administración. */
  readOnly?: boolean;
}

const pill = (bg: string) => ({
  bgcolor: bg,
  color: "common.white",
  px: 1.5,
  py: 0.5,
  borderRadius: "24px",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: "16px",
  width: "fit-content",
});

const clamp = (lines: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
});

// Fila de la vista de lista (Figma "Lista"). Mismos datos y acciones que
// ProductCard; solo cambia la presentación.
const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  currentCategory,
  onClick,
  onPromotionClick,
  onDeleteClick,
  onMoveClick,
  readOnly = false,
}) => {
  const discount = Number(product.discountPercent ?? 0);
  const showDiscount = !isNaN(discount) && discount > 0;
  const hasMultibuy = !!product.multibuyOption;
  const hasPriceDiscount =
    showDiscount ||
    !!product.primaryPriceWithDiscount ||
    !!product.secondaryPriceWithDiscount;
  const isAvailable = product.is_available ?? product.is_active ?? true;

  const countdown = usePromotionCountdown({
    status: product.promotionStatus,
    startsAt: product.promotionStartsAt,
    endsAt: product.promotionEndsAt,
  });

  const stopper = product.isFavorite
    ? "FAVORITE"
    : product.isRecommended
      ? "RECOMMENDED"
      : undefined;

  let primary: React.ReactNode;
  let secondary: React.ReactNode = null;
  let struck: React.ReactNode = null;
  if (hasPriceDiscount && !hasMultibuy && product.primaryPriceWithDiscount) {
    primary = product.primaryPriceWithDiscount;
    struck = product.primaryPrice;
    secondary = product.secondaryPriceWithDiscount;
  } else if (product.primaryPrice) {
    primary = product.primaryPrice;
    secondary = product.secondaryPrice;
  } else {
    primary = formatPrice(product.price);
    secondary = product.priceAlt ? formatPrice(product.priceAlt) : null;
  }

  const hasBadges = showDiscount || hasMultibuy || !isAvailable;
  const hasMeta = !!countdown || !!stopper;

  return (
    <Box
      data-testid="product-list-item"
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: { xs: 3, md: 4 },
        p: { xs: 2, md: 3 },
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: { xs: "16px", md: "20px" },
        cursor: "pointer",
        minWidth: 0,
        transition: "background-color 0.2s",
        "&:hover": { backgroundColor: "#EEF6FF" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          flexShrink: 0,
          width: { xs: 70, md: 64 },
          height: { xs: 70, md: 64 },
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Box
          component="img"
          src={product.image || defaultImage}
          alt={product.name}
          loading="lazy"
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Mobile: etiquetas sobre la imagen (Figma). */}
        {(showDiscount || hasMultibuy) && (
          <Box
            sx={{
              position: "absolute",
              top: 4,
              left: 4,
              display: { xs: "flex", md: "none" },
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            {showDiscount && <Box sx={pill("#E53935")}>-{discount}%</Box>}
            {hasMultibuy && (
              <Box sx={pill("#1E5BE8")}>{product.multibuyOption}</Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {(hasMeta || hasBadges) && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              columnGap: 2,
              rowGap: 0.5,
              mb: 1,
            }}
          >
            {/* Desktop: etiquetas en línea antes del nombre (Figma). */}
            {showDiscount && (
              <Box sx={{ ...pill("#E53935"), display: { xs: "none", md: "block" } }}>
                -{discount}%
              </Box>
            )}
            {hasMultibuy && (
              <Box sx={{ ...pill("#1E5BE8"), display: { xs: "none", md: "block" } }}>
                {product.multibuyOption}
              </Box>
            )}
            {!isAvailable && <Box sx={pill("#BDBDBD")}>No disponible</Box>}
            {countdown && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: "error.light",
                  color: "error.main",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                {countdown.label}
              </Box>
            )}
            {stopper && (
              <Box sx={{ "& > div": { mb: 0, whiteSpace: "nowrap" } }}>
                <ProductStopperTag stopper={stopper} />
              </Box>
            )}
          </Box>
        )}
        <Typography
          sx={{
            ...clamp(1),
            fontSize: { xs: 13, md: 15 },
            fontWeight: 500,
            color: "#4F4F4F",
            lineHeight: "20px",
          }}
        >
          {product.name}
        </Typography>
        {product.description && (
          <Typography
            sx={{
              ...clamp(2),
              fontSize: 12,
              color: "#4F4F4F",
              lineHeight: "16px",
              mt: 0.5,
            }}
          >
            {product.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Typography
          color="primary"
          fontWeight={600}
          fontSize={{ xs: 14, md: 18 }}
          lineHeight="22px"
          noWrap
        >
          {primary}
        </Typography>
        {struck && (
          <Typography
            fontSize={12}
            color="grey.500"
            sx={{ textDecoration: "line-through" }}
            noWrap
          >
            {struck}
          </Typography>
        )}
        {secondary && (
          <Typography fontSize={12} color="grey.500" noWrap>
            {secondary}
          </Typography>
        )}
      </Box>

      {!readOnly && (
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ flexShrink: 0, display: "flex" }}
        >
          <ProductActionsMenu
            product={product}
            currentCategory={currentCategory}
            onPromotionClick={onPromotionClick}
            onDeleteClick={onDeleteClick}
            onMoveClick={onMoveClick}
            triggerSx={{ p: 1, bgcolor: "grey.50", borderRadius: 2 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductListItem;
