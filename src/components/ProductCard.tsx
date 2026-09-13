import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import defaultImage from "../assets/images/default-product.png"; // you can replace this path
import { styled } from "@mui/material/styles";
import { ProductGridItem } from "../types/product";
import { formatPrice, truncateText } from "../utils/format";
import { usePromotionCountdown } from "../hooks/usePromotionCountdown";
import ProductStopperTag from "./ProductStopperTag";
import ProductActionsMenu, { ProductCategoryRef } from "./ProductActionsMenu";

interface ProductCardProps {
  product: ProductGridItem;
  currentCategory?: ProductCategoryRef;
  onClick?: () => void;
  onPromotionClick?: (product: ProductGridItem) => void;
  onDeleteClick?: (product: ProductGridItem) => void;
  onMoveClick?: (
    product: ProductGridItem,
    currentCategory?: ProductCategoryRef,
  ) => void;
}

const LineClamp = styled(Typography)({
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

const styles = {
  cardContainer: {
    position: "relative",
    width: "100%",
    boxShadow: 0,
    backgroundColor: "transparent",
    borderRadius: 3,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    // Breathing room between the hover surface and the image/content it
    // wraps, so the hover tint never sits flush against the image edge.
    padding: "12px 11px",
    transition: "background-color 0.2s",
    cursor: "pointer", // 👈 makes it feel clickable
    "&:hover": {
      backgroundColor: "#EEF6FF", // 👈 hover surface (design spec)
    },
    "&:hover .menu-button": {
      opacity: 1,
    },
  },
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentCategory,
  onClick,
  onPromotionClick,
  onDeleteClick,
  onMoveClick,
}) => {
  const discountNumber = Number(product.discountPercent ?? 0);
  const showDiscount = !isNaN(discountNumber) && discountNumber > 0;
  const discountLabel = showDiscount
    ? discountNumber % 1 === 0
      ? String(discountNumber)
      : String(discountNumber)
    : null;
  // Matches ProductDetailPricing's hasDiscount: also treat presence of
  // backend "with discount" labels as a discount signal, so the grid and
  // detail views stay consistent even if discountPercent reads as 0.
  const hasPriceDiscount =
    showDiscount ||
    !!product.primaryPriceWithDiscount ||
    !!product.secondaryPriceWithDiscount;
  const hasMultibuy = !!product.multibuyOption;

  const promotionCountdown = usePromotionCountdown({
    status: product.promotionStatus,
    startsAt: product.promotionStartsAt,
    endsAt: product.promotionEndsAt,
  });

  const renderPromotionBadge = () => {
    if (!promotionCountdown) return null;

    // The countdown pill always uses the same danger-toned colors regardless
    // of phase (scheduled vs. actively counting down) — it must never depend
    // on discount, multibuy, price, or any other product attribute.
    return (
      <Box
        sx={{
          backgroundColor: "error.light",
          color: "error.main",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: 12,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 2,
          width: "fit-content",
        }}
      >
        <AccessTimeIcon sx={{ fontSize: 16 }} />
        {promotionCountdown.label}
      </Box>
    );
  };

  const renderAvailabilityBadge = (product: ProductGridItem) => {
    const isAvailable = product.is_available ?? product.is_active ?? true;
    if (isAvailable) return null;

    return (
      <Box
        sx={{
          backgroundColor: "#BDBDBD",
          color: "white",
          px: 2,
          py: 1,
          borderRadius: 1,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          mt: 1,
          width: "fit-content",
        }}
      >
        <Typography color="white" fontWeight={500}>
          No disponible
        </Typography>
      </Box>
    );
  };

  return (
    <Card
      data-testid="product-card"
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onClick?.();
      }}
      sx={styles.cardContainer}
    >
      {/* Image and discount tag */}
      <Box position="relative">
        <Box
          sx={{
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: { xs: 3, lg: 4 },
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={product.image || defaultImage}
            alt={product.name}
            loading="lazy"
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              display: "block",
            }}
          />
        </Box>
        {/* Badges container (top-left) */}
        <Box
          sx={{
            position: "absolute",
            top: 15,
            left: 15,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 0,
          }}
        >
          {(() => {
            const isAvailable =
              product.is_available ?? product.is_active ?? true;
            if (!isAvailable) {
              return renderAvailabilityBadge(product);
            }

            return (
              <>
                {showDiscount && (
                  <Box
                    component="span"
                    sx={(theme) => ({
                      bgcolor: "error.main",
                      color: theme.palette.common.white,
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      display: "inline-block",
                    })}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: (theme) => theme.palette.common.white,
                      }}
                    >
                      -{discountLabel}%
                    </Typography>
                  </Box>
                )}

                {hasMultibuy && (
                  <Box
                    component="span"
                    sx={(theme) => ({
                      bgcolor: "primary.main",
                      color: theme.palette.common.white,
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      display: "inline-block",
                    })}
                  >
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: (theme) => theme.palette.common.white,
                      }}
                    >
                      {product.multibuyOption}
                    </Typography>
                  </Box>
                )}
              </>
            );
          })()}
        </Box>

        {/* Action button: anchored to the image wrapper (not the padded
            Card) so its position stays fixed at the image's corner
            regardless of the outer card padding added for the hover
            surface. */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            opacity: 0,
            transition: "opacity 0.2s",
            zIndex: 2,
            "& .MuiIconButton-root": {
              padding: "4px",
            },
            pointerEvents: "auto",
            backgroundColor: "grey.200",
            borderRadius: 2,
            p: 1,
          }}
          className="menu-button"
        >
          <ProductActionsMenu
            product={product}
            currentCategory={currentCategory}
            onPromotionClick={onPromotionClick}
            onDeleteClick={onDeleteClick}
            onMoveClick={onMoveClick}
          />
        </Box>
      </Box>

      <CardContent sx={{ p: 2, backgroundColor: "transparent" }}>
        {/* Views */}
        {product.views !== undefined && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <VisibilityIcon fontSize="small" />
            <Typography variant="caption">
              {product.views.toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Optional tag (now using reusable stopper) */}
        {(() => {
          const stopper = product.isFavorite
            ? "FAVORITE"
            : product.isRecommended
              ? "RECOMMENDED"
              : undefined;
          return <ProductStopperTag stopper={stopper} />;
        })()}

        {/* Countdown pill: below the stopper ribbon, above the title */}
        {renderPromotionBadge()}

        {/* Product name */}
        <LineClamp sx={{ fontSize: 14, fontWeight: 500, color: "#4F4F4F" }}>
          {product.name}
        </LineClamp>

        {/* Description summary: truncated to 60 chars, full text on hover */}
        {product.description && (
          <Tooltip title={product.description} arrow>
            <LineClamp sx={{ mt: 1, mb: 1, fontSize: 12, color: "#4F4F4F" }}>
              {truncateText(product.description, 60)}
            </LineClamp>
          </Tooltip>
        )}

        {/* Prices: prefer formatted labels from backend (primaryPrice / secondaryPrice)
            otherwise fall back to numeric price / priceAlt formatted with formatPrice.
            When an active percentage discount applies (and it's not a 2x1/3x2-style
            multibuy promotion), show the discounted price as primary and the
            original price struck through below it. */}
        <Box mt={1}>
          {hasPriceDiscount && !hasMultibuy && product.primaryPriceWithDiscount ? (
            <>
              <Typography color="primary" fontWeight={500} fontSize={18}>
                {product.primaryPriceWithDiscount}
              </Typography>
              {product.primaryPrice && (
                <Typography
                  fontSize={14}
                  color="grey.500"
                  sx={{ textDecoration: "line-through" }}
                >
                  Antes {product.primaryPrice}
                </Typography>
              )}
              {product.secondaryPriceWithDiscount && (
                <Typography fontSize={14} color="grey.500">
                  {product.secondaryPriceWithDiscount}
                </Typography>
              )}
            </>
          ) : product.primaryPrice ? (
            <>
              <Typography color="primary" fontWeight={500} fontSize={18}>
                {product.primaryPrice}
              </Typography>
              {product.secondaryPrice && (
                <Typography fontSize={14} color="grey.500">
                  {product.secondaryPrice}
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography color="primary" fontWeight={500} fontSize={18}>
                {formatPrice(product.price)}
              </Typography>
              {product.priceAlt && (
                <Typography fontSize={14} color="textSecondary">
                  {formatPrice(product.priceAlt)}
                </Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
