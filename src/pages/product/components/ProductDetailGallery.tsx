import QrCode2Icon from "@mui/icons-material/QrCode2";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { Box, Button, ButtonBase, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import defaultImage from "../../../assets/images/default-product.png";
import { withSourceParam } from "../../../analytics/source";
import ArQrDialog from "../../../components/ArQrDialog";
import ProductModelViewer from "../../../components/ProductModelViewer";
import ProductPromotionBadge from "../../../components/ProductPromotionBadge";
import { useMediaObjectUrl } from "../../../hooks/useMediaObjectUrl";
import { Product } from "../../../types/product";
import { withModel3dView } from "../../../utils/publicUrls";
import { VideoThumbnail } from "./VideoThumbnail";

const ProductDetailGallery: React.FC<{
  product: Product;
  /** Offset (px) from the viewport top where the gallery sticks at md+. */
  stickyTop?: number;
  /** "3d" abre la galería directamente en el modelo 3D (si lo hay). */
  initialView?: "3d";
  /** URL pública del producto: habilita el QR "Ver en tu celular". */
  publicUrl?: string;
}> = ({ product, stickyTop = 0, initialView, publicUrl }) => {
  const media = product.media?.filter((m) => !m._delete) ?? [];
  // El modelo 3D va como último ítem, después de los medios existentes.
  const model3d =
    product.model3d?.glbFile && !product.model3d._delete
      ? product.model3d
      : null;
  const modelIndex = model3d ? media.length : -1;
  const [mainIndex, setMainIndex] = React.useState(() =>
    initialView === "3d" && model3d ? media.length : 0,
  );
  const mainMedia = media.length > 0 ? media[mainIndex] : null;
  const isModelSelected = model3d !== null && mainIndex === modelIndex;
  // Solo URLs estables: un object URL nuevo por render recargaría el visor.
  const glbUrl = useMediaObjectUrl(model3d?.glbFile);
  const usdzUrl = useMediaObjectUrl(model3d?.usdzFile);
  // null = todavía no se sabe (el visor reporta tras `load`).
  const [canActivateAR, setCanActivateAR] = React.useState<boolean | null>(
    null,
  );
  const [qrOpen, setQrOpen] = React.useState(false);
  const hasFinePointer = useMediaQuery("(pointer: fine)");
  const showQrButton =
    isModelSelected &&
    canActivateAR === false &&
    hasFinePointer &&
    Boolean(publicUrl);

  // Normalize url or file to string safely
  const resolveUrl = (file: any) => {
    try {
      if (!file) return "";
      if (typeof file === "string") return file;
      if (file instanceof File) return URL.createObjectURL(file);
      // fallback
      return String(file);
    } catch (e) {
      return "";
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Mobile with exactly one image: no thumbnail rail (nothing to choose from),
  // so the main image uses the full gallery width. Zero-media fallback and a
  // single video keep their current layout.
  const hideThumbnailRail =
    isMobile &&
    media.length === 1 &&
    !model3d &&
    media[0].media_type !== "video";
  const _rawDiscount = Number(product.discountPercentage ?? 0);
  const numericDiscount = Number.isFinite(_rawDiscount) ? _rawDiscount : 0;
  const multibuyOption = product.multibuyOption || "";

  return (
    <Box
      data-testid="product-detail-gallery"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        // Miniaturas + media principal se mantienen juntas al hacer scroll
        // solo en escritorio; en xs/sm fluye estático.
        position: { xs: "static", md: "sticky" },
        top: { md: stickyTop },
        alignSelf: "start",
      }}
    >
      <Grid container spacing={3}>
        {!hideThumbnailRail && (
          <Grid item xs={3} sm={2}>
            <Box display="flex" flexDirection="column" gap={3}>
              {media.map((item: any, idx: number) => (
                <Box
                  key={item.id || idx}
                  onClick={() => setMainIndex(idx)}
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: idx === mainIndex ? "2px solid" : "1px solid",
                    borderColor:
                      idx === mainIndex ? "primary.main" : "grey.300",
                  }}
                >
                  {item.media_type === "video" ? (
                    <VideoThumbnail
                      url={resolveUrl(item.file)}
                      width={54}
                      height={54}
                    />
                  ) : (
                    <img
                      src={resolveUrl(item.file)}
                      alt={item.name || "thumb"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </Box>
              ))}
              {model3d && (
                <ButtonBase
                  onClick={() => setMainIndex(modelIndex)}
                  aria-label="Ver modelo 3D"
                  aria-pressed={isModelSelected}
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    border: isModelSelected ? "2px solid" : "1px solid",
                    borderColor: isModelSelected ? "primary.main" : "grey.300",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.25,
                    color: "text.primary",
                  }}
                >
                  <ViewInArIcon fontSize="small" aria-hidden />
                  <Typography
                    component="span"
                    variant="caption"
                    fontWeight={600}
                    lineHeight={1}
                  >
                    3D
                  </Typography>
                </ButtonBase>
              )}
            </Box>
          </Grid>
        )}
        <Grid
          item
          xs={hideThumbnailRail ? 12 : 9}
          sm={hideThumbnailRail ? 12 : 10}
        >
          <Box
            data-testid="product-detail-media"
            sx={{
              border: "1px solid",
              borderColor: "grey.400",
              borderRadius: 1.5,
              overflow: "hidden",
              aspectRatio: "1 / 1",
              width: "100%",
              position: "relative",
            }}
          >
            {/* Promociones (descuento / multicompra) sobre la esquina superior
                izquierda del media */}
            {(numericDiscount > 0 || multibuyOption) && (
              <Box
                data-testid="gallery-badge-container"
                sx={{
                  position: "absolute",
                  left: 24,
                  top: 24,
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1,
                  // El visor 3D recibe los gestos aunque pasen bajo las pills.
                  ...(isModelSelected && { pointerEvents: "none" }),
                }}
              >
                {numericDiscount > 0 && (
                  <ProductPromotionBadge
                    kind="discount"
                    value={numericDiscount}
                  />
                )}
                {multibuyOption && (
                  <ProductPromotionBadge
                    kind="multibuy"
                    value={multibuyOption}
                  />
                )}
              </Box>
            )}

            {isModelSelected ? (
              <ProductModelViewer
                glbUrl={glbUrl}
                usdzUrl={usdzUrl || undefined}
                alt={`Modelo 3D de ${product.name}`}
                onArAvailability={setCanActivateAR}
              />
            ) : mainMedia?.media_type === "video" ? (
              <video
                src={resolveUrl(mainMedia.file)}
                controls
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                src={resolveUrl(mainMedia ? mainMedia.file : defaultImage)}
                alt={product.name}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </Box>
          {showQrButton && publicUrl && (
            <>
              <Button
                variant="outlined"
                startIcon={<QrCode2Icon />}
                onClick={() => setQrOpen(true)}
                sx={{ mt: 2 }}
              >
                Ver en tu celular
              </Button>
              <ArQrDialog
                open={qrOpen}
                onClose={() => setQrOpen(false)}
                url={withSourceParam(withModel3dView(publicUrl), "qr")}
              />
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailGallery;
