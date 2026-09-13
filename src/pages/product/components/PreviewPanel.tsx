import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Typography } from "@mui/material";
import React from "react";
import { Category } from "../../../types/category";
import { Product } from "../../../types/product";
import { useBusinessAccountInfo } from "../../../hooks/useBusinessAccountInfo";
import { useMediaObjectUrl } from "../../../hooks/useMediaObjectUrl";
import { formatPrice } from "../../../utils/format";
import { VideoThumbnail } from "./VideoThumbnail";

interface PreviewPanelProps {
  section: string;
  values: Product;
  selectedCategory: Category | null;
}

// Renders one media file (image or video) filling its parent box. A real
// component (not a helper called inline in a .map()) so it can own its own
// object-URL lifecycle via useMediaObjectUrl instead of creating/leaking a
// new blob URL on every PreviewPanel re-render.
const MediaPreviewThumb: React.FC<{
  file: File | Blob | string | null | undefined;
  isVideo?: boolean;
}> = ({ file, isVideo }) => {
  const url = useMediaObjectUrl(file);
  if (isVideo) {
    return <VideoThumbnail url={url} width="100%" height="100%" borderRadius={0} />;
  }
  return (
    <img
      src={url}
      alt=""
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
};

// Desktop-only mirror of the live form data for the currently selected
// section — not a full product preview, just what that one section holds.
// Pure prop/Formik-values mirror, no fetching of its own beyond the
// currency code (same pattern already used by ProductSection/ExtrasSection/
// VariationsSection).
const PreviewPanel: React.FC<PreviewPanelProps> = ({
  section,
  values,
  selectedCategory,
}) => {
  const { data: businessAccountInfo } = useBusinessAccountInfo();
  const currencyCode = businessAccountInfo?.primary_currency_code;

  const activeMedia = (values.media ?? []).filter((m: any) => !m._delete);
  const images = activeMedia.filter((m: any) => m.media_type === "image");
  const video = activeMedia.find((m: any) => m.media_type === "video");
  const coverMedia = images[0] ?? video ?? null;

  const priceLabel = (price: number | string | undefined) => {
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    const safePrice = numericPrice && !Number.isNaN(numericPrice) ? numericPrice : 0;
    return `${currencyCode ? `${currencyCode} ` : ""}${formatPrice(safePrice)}`;
  };

  const renderProducto = () => (
    <>
      {(images.length > 0 || video) && (
        <Box display="flex" gap={2} mb={3}>
          <Box display="flex" flexDirection="column" gap={1}>
            {[...images, ...(video ? [video] : [])].map((m: any) => (
              <Box
                key={m.id}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  overflow: "hidden",
                  border: coverMedia?.id === m.id ? "2px solid" : "1px solid",
                  borderColor: coverMedia?.id === m.id ? "primary.main" : "grey.600",
                }}
              >
                <MediaPreviewThumb file={m.file} isVideo={m.media_type === "video"} />
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              width: 180,
              height: 180,
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "grey.600",
            }}
          >
            {coverMedia && (
              <MediaPreviewThumb
                file={coverMedia.file}
                isVideo={coverMedia.media_type === "video"}
              />
            )}
          </Box>
        </Box>
      )}
      <Typography variant="h6" fontWeight="bold">
        {values.name || "Nombre del producto"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Categoría:{" "}
        <Box component="span" color="primary.main">
          {selectedCategory?.name || "Sin Categoría"}
        </Box>
      </Typography>
      {values.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {values.description}
        </Typography>
      )}
      <Typography variant="h6" color="primary.main" fontWeight="bold">
        {priceLabel(values.price)}
      </Typography>
    </>
  );

  const renderVariaciones = () => {
    const visibleVariants = (values.variants ?? []).filter((v: any) => !v._delete);
    if (visibleVariants.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Todavía no agregaste variaciones.
        </Typography>
      );
    }
    return (
      <>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
          Variaciones de este producto
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          {visibleVariants.map((variant: any, index: number) => (
            <Box
              key={variant.id ?? index}
              sx={{
                bgcolor: "grey.50",
                borderRadius: "12px",
                pl: 2,
                pr: 4,
                py: 2,
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box display="flex" alignItems="center" gap={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #E0E0E0",
                    backgroundColor: "white",
                    flexShrink: 0,
                  }}
                >
                  {variant.image && <MediaPreviewThumb file={variant.image} />}
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" noWrap sx={{ color: "#4F4F4F" }}>
                    {variant.name || "Presentación"}
                  </Typography>
                  {variant.description && (
                    <Typography
                      variant="caption"
                      noWrap
                      display="block"
                      sx={{ color: "#4F4F4F" }}
                    >
                      {variant.description}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="primary.main">
                {priceLabel(variant.price)}
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    );
  };

  const renderAdicionales = () => {
    const visibleAddons = (values.addons ?? []).filter((a: any) => !a._delete);
    if (visibleAddons.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          Todavía no agregaste adicionales o extras.
        </Typography>
      );
    }
    return (
      <>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
          Adicionales o extras
        </Typography>
        <Box display="flex" flexDirection="column" width="100%">
          {visibleAddons.map((addon: any, index: number) => {
            const isFirst = index === 0;
            const isLast = index === visibleAddons.length - 1;
            return (
              <Box
                key={addon.id ?? index}
                display="flex"
                justifyContent="space-between"
                gap={2}
                sx={{
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "grey.400",
                  borderTopLeftRadius: isFirst ? 12 : 0,
                  borderTopRightRadius: isFirst ? 12 : 0,
                  borderBottomLeftRadius: isLast ? 12 : 0,
                  borderBottomRightRadius: isLast ? 12 : 0,
                  mt: isFirst ? 0 : "-1px",
                  px: 3,
                  py: 2,
                }}
              >
                <Typography variant="body2" noWrap>
                  {addon.name || "Adicional"}
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold" flexShrink={0}>
                  {priceLabel(addon.price)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </>
    );
  };

  const renderDestacados = () => {
    const hasDiscount =
      values.isPromotionActive &&
      values.promotionOption === "descuento" &&
      Number(values.discountPercentage) > 0;
    const discountedPrice = hasDiscount
      ? Number(values.price) * (1 - Number(values.discountPercentage) / 100)
      : null;
    return (
      <>
        <Box
          sx={{
            position: "relative",
            width: 180,
            height: 180,
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.600",
            mb: 2,
          }}
        >
          {coverMedia && (
            <MediaPreviewThumb file={coverMedia.file} isVideo={coverMedia.media_type === "video"} />
          )}
          {hasDiscount && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "error.main",
                color: "white",
                fontWeight: "bold",
                fontSize: 12,
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              -{values.discountPercentage}%
            </Box>
          )}
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {values.name || "Nombre del producto"}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          {!!values.stopper && (
            <Box
              sx={{
                backgroundColor: values.stopper === "FAVORITE" ? "#FFD401" : "primary.main",
                color: values.stopper === "FAVORITE" ? "#4B4B4B" : "white",
                fontSize: 12,
                fontWeight: "bold",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {values.stopper === "FAVORITE" ? "Favorito del mes" : "Recomendado"}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            en categoría:{" "}
            <Box component="span" color="primary.main">
              {selectedCategory?.name || "Sin Categoría"}
            </Box>
          </Typography>
        </Box>
        {hasDiscount ? (
          <>
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {priceLabel(discountedPrice ?? 0)}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: "line-through" }}
            >
              Antes {priceLabel(values.price)}
            </Typography>
          </>
        ) : (
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            {priceLabel(values.price)}
          </Typography>
        )}
      </>
    );
  };

  const renderBySection = () => {
    switch (section) {
      case "Variaciones":
        return renderVariaciones();
      case "Adicionales o extras":
        return renderAdicionales();
      case "Destacar producto":
        return renderDestacados();
      default:
        return renderProducto();
    }
  };

  return (
    <Box sx={{ width: 330, flexShrink: 0, ml: 5, pr: 8 }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
        <VisibilityIcon fontSize="small" />
        <Typography variant="subtitle1" fontWeight="bold">
          Previsualización
        </Typography>
      </Box>
      {renderBySection()}
    </Box>
  );
};

export default PreviewPanel;
