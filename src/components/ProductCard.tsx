import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
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
  /** Public/read-only rendering: hides the hover admin actions menu. */
  readOnly?: boolean;
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
    borderRadius: { xs: 3, md: "22px" },
    display: "flex",
    flexDirection: "column",
    // Structural gap between the image and the content block: mobile owns
    // that spacing entirely through CardContent's own padding (no gap);
    // desktop restores the original flex gap between the two children.
    gap: { xs: 0, md: "24px" },
    padding: { xs: "6px", md: "12px 11px" },
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

// Shared geometry for the discount/multibuy pills anchored to the image's
// top-left corner. Extracted because both badges are identical except for
// color and label — a generic reusable badge abstraction is not warranted
// beyond this real duplication.
const ProductBadge: React.FC<{
  backgroundColor: string;
  children: React.ReactNode;
}> = ({ backgroundColor, children }) => (
  <Box
    component="span"
    data-testid="product-badge"
    sx={{
      bgcolor: backgroundColor,
      color: "common.white",
      px: 2,
      py: 1,
      borderRadius: "24px",
      display: "inline-block",
    }}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 500, fontSize: 14, color: "common.white" }}
    >
      {children}
    </Typography>
  </Box>
);

// "No disponible" is its own variant (not a conditional style mixed into the
// promotion badges), rendered as two reciprocal-display presentation
// wrappers — only one is ever part of the accessibility tree at a given
// breakpoint (the other is `display: none`), so there's a single accessible
// label at any active breakpoint. Below `md` it's a centered overlay on the
// image; at `md` and above it renders as a flex child *inside* the same
// badge container as the discount/multibuy pills (see below), so it stacks
// below them via the container's own `gap` instead of overlapping them at
// the shared corner position — preserving 2a416d9's discount + "No
// disponible" co-display fix at desktop too.
const AvailabilityCornerBadge: React.FC = () => (
  <Box
    sx={{
      display: { xs: "none", md: "inline-flex" },
      backgroundColor: "#BDBDBD",
      color: "white",
      px: 2,
      py: 1,
      borderRadius: "24px",
      alignItems: "center",
    }}
  >
    <Typography color="white" fontWeight={500} fontSize={14}>
      No disponible
    </Typography>
  </Box>
);

const AvailabilityOverlayBadge: React.FC = () => (
  <Box
    sx={{
      position: "absolute",
      top: "12px",
      left: 0,
      right: 0,
      display: { xs: "flex", md: "none" },
      justifyContent: "center",
      zIndex: 1,
    }}
  >
    <Box
      sx={{
        backgroundColor: "#BDBDBD",
        color: "white",
        p: 1,
        borderRadius: "24px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography color="white" fontWeight={500} fontSize={14}>
        No disponible
      </Typography>
    </Box>
  </Box>
);

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentCategory,
  onClick,
  onPromotionClick,
  onDeleteClick,
  onMoveClick,
  readOnly = false,
}) => {
  const theme = useTheme();
  // The description tooltip is a desktop-only affordance (mouse hover); on
  // touch/mobile the truncated text stays the only way to read the
  // description, matching the pre-existing mobile behavior.
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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
  const isAvailable = product.is_available ?? product.is_active ?? true;

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
            borderRadius: { xs: "18px", md: "16px" },
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
        {/* Badges container (top-left): discount/multibuy only. Availability
            is a separate variant rendered as a centered overlay below, not a
            conditional style mixed into this corner. */}
        <Box
          data-testid="product-badge-container"
          sx={{
            position: "absolute",
            top: { xs: "12px", md: "15px" },
            left: { xs: "12px", md: "15px" },
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 0,
          }}
        >
          {showDiscount && (
            <ProductBadge backgroundColor="error.main">
              -{discountLabel}%
            </ProductBadge>
          )}

          {hasMultibuy && (
            <ProductBadge backgroundColor="primary.main">
              {product.multibuyOption}
            </ProductBadge>
          )}

          {!isAvailable && <AvailabilityCornerBadge />}
        </Box>

        {!isAvailable && <AvailabilityOverlayBadge />}

        {/* Action button: anchored to the image wrapper (not the padded
            Card) so its position stays fixed at the image's corner
            regardless of the outer card padding added for the hover
            surface. */}
        {!readOnly && (
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
        )}
      </Box>

      <CardContent
        sx={{
          pt: 2,
          px: { xs: 0, md: 2 },
          pb: { xs: 3, md: 2 },
          backgroundColor: "transparent",
          "&:last-child": { pb: { xs: 3, md: 2 } },
        }}
      >
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
        <LineClamp
          sx={{
            fontSize: { xs: 12, md: 14 },
            lineHeight: { xs: "14px", md: "18px" },
            fontWeight: 500,
            color: "#4F4F4F",
          }}
        >
          {product.name}
        </LineClamp>

        {/* Description summary: truncated to 60 chars. The tooltip is kept
            below `md` for the pre-existing touch behavior and disabled on
            desktop, where the review explicitly requested its removal. */}
        {product.description && (
          <Tooltip
            title={product.description}
            arrow
            disableHoverListener={isDesktop}
            disableFocusListener={isDesktop}
          >
            <LineClamp
              sx={{
                mt: 1,
                mb: { xs: 0, md: 1 },
                fontSize: 12,
                color: "#4F4F4F",
                lineHeight: { xs: "14px", md: "18px" },
                fontWeight: 400,
              }}
            >
              {truncateText(product.description, 60)}
            </LineClamp>
          </Tooltip>
        )}

        {/* Prices: prefer formatted labels from backend (primaryPrice / secondaryPrice)
            otherwise fall back to numeric price / priceAlt formatted with formatPrice.
            When an active percentage discount applies (and it's not a 2x1/3x2-style
            multibuy promotion), show the discounted price as primary and the
            original price struck through below it. */}
        {/* mt is the owner of the gap above the prices block: mobile collapses
            the description's own margin to 0 so this single value is the full
            gap; desktop restores both original margins. */}
        <Box mt={{ xs: 2, md: 1 }}>
          {hasPriceDiscount && !hasMultibuy && product.primaryPriceWithDiscount ? (
            <>
              <Typography
                color="primary"
                fontWeight={{ xs: 600, md: 500 }}
                fontSize={{ xs: 14, md: 18 }}
                lineHeight={{ xs: "14px", md: "22px" }}
              >
                {product.primaryPriceWithDiscount}
              </Typography>
              {product.primaryPrice && (
                <Typography
                  fontSize={{ xs: 12, md: 14 }}
                  lineHeight={{ xs: "14px", md: "22px" }}
                  color="grey.500"
                  sx={{ textDecoration: "line-through" }}
                >
                  Antes {product.primaryPrice}
                </Typography>
              )}
              {product.secondaryPriceWithDiscount && (
                <Typography
                  fontSize={{ xs: 12, md: 14 }}
                  lineHeight={{ xs: "14px", md: "22px" }}
                  color="grey.500"
                  fontWeight={400}
                >
                  {product.secondaryPriceWithDiscount}
                </Typography>
              )}
            </>
          ) : product.primaryPrice ? (
            <>
              <Typography
                color="primary"
                fontWeight={{ xs: 600, md: 500 }}
                fontSize={{ xs: 14, md: 18 }}
                lineHeight={{ xs: "14px", md: "22px" }}
              >
                {product.primaryPrice}
              </Typography>
              {product.secondaryPrice && (
                <Typography
                  fontSize={{ xs: 12, md: 14 }}
                  lineHeight={{ xs: "14px", md: "22px" }}
                  color="grey.500"
                  fontWeight={400}
                >
                  {product.secondaryPrice}
                </Typography>
              )}
            </>
          ) : (
            <>
              <Typography
                color="primary"
                fontWeight={{ xs: 600, md: 500 }}
                fontSize={{ xs: 14, md: 18 }}
                lineHeight={{ xs: "14px", md: "22px" }}
              >
                {formatPrice(product.price)}
              </Typography>
              {product.priceAlt && (
                <Typography
                  fontSize={{ xs: 12, md: 14 }}
                  lineHeight={{ xs: "14px", md: "22px" }}
                  color="textSecondary"
                  fontWeight={400}
                >
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
