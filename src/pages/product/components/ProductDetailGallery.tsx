import { Box, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React from "react";
import defaultImage from "../../../assets/images/default-product.png";
import { Product } from "../../../types/product";
import { VideoThumbnail } from "./VideoThumbnail";

const ProductDetailGallery: React.FC<{ product: Product }> = ({ product }) => {
  const media = product.media?.filter((m) => !m._delete) ?? [];
  const [mainIndex, setMainIndex] = React.useState(0);
  const mainMedia = media.length > 0 ? media[mainIndex] : null;

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
    isMobile && media.length === 1 && media[0].media_type !== "video";
  // Prepare formatted discount string: hide ".00" when discount is an integer
  const _rawDiscount = Number(product.discountPercentage ?? 0);
  const numericDiscount = Number.isFinite(_rawDiscount) ? _rawDiscount : 0;
  const formattedDiscount = Number.isInteger(numericDiscount)
    ? numericDiscount.toString()
    : parseFloat(numericDiscount.toFixed(2)).toString();

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
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
            </Box>
          </Grid>
        )}
        <Grid
          item
          xs={hideThumbnailRail ? 12 : 9}
          sm={hideThumbnailRail ? 12 : 10}
        >
          <Box
            sx={{
              border: "1px solid",
              borderColor: "grey.400",
              borderRadius: 1.5,
              pt: 6,
              pl: 6,
              pr: "10px",
              pb: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              aspectRatio: "1 / 1",
              width: "100%",
              position: "relative",
            }}
          >
            {/* Discount badge overlay if product has discount */}
            {numericDiscount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  left: 24,
                  top: 24,
                  bgcolor: theme.palette.error.main,
                  color: theme.palette.common.white,
                  px: 1.5,
                  py: 1,
                  borderRadius: "3px",
                }}
              >
                <Typography variant="body2" color="white" fontWeight={500}>
                  -{formattedDiscount}%
                </Typography>
              </Box>
            )}

            {mainMedia?.media_type === "video" ? (
              <video
                src={resolveUrl(mainMedia.file)}
                controls
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: 6,
                }}
              />
            ) : (
              <img
                src={resolveUrl(mainMedia ? mainMedia.file : defaultImage)}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailGallery;
