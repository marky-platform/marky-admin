import { Box, Typography } from "@mui/material";
import React from "react";
import { ProductVariant } from "../../../types/product";
import { formatPrice } from "../../../utils/format";
import defaultProductImage from "../../../assets/images/producto_sin_imagenes.png";

const ProductVariantsList: React.FC<{ variants: ProductVariant[] }> = ({
  variants,
}) => {
  if (!variants || variants.length === 0) return null;

  const getVariantImageUrl = (image?: File | string, thumbnail?: string) => {
    // La miniatura (60px) solo aplica si la imagen sigue siendo la URL original.
    if (typeof image === "string" && thumbnail) return thumbnail;
    if (!image) return undefined;
    if (typeof image === "string") return image;
    try {
      return URL.createObjectURL(image as File);
    } catch (e) {
      return undefined;
    }
  };

  return (
    <Box sx={{ mt: 0 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Variaciones de este producto
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        {variants.map((v, index) => {
          const imageUrl = getVariantImageUrl(v.image, v.thumbnail) ?? defaultProductImage;
          return (
            <Box
              key={v.id ?? index}
              sx={{
                pl: 2,
                pr: 4,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 3,
                backgroundColor: "grey.50",
              }}
            >
              <Box display="flex" gap={4} alignItems="center">
                <Box
                  component="img"
                  src={imageUrl}
                  alt={v.name}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    objectFit: "cover",
                    backgroundColor: "grey.200",
                  }}
                />
                <Box>
                  <Typography>{v.name}</Typography>
                  {v.description && (
                    <Typography variant="caption" color="text.secondary">
                      {v.description}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box
                display="flex"
                alignItems="end"
                justifyContent={"flex-end"}
                gap={1}
                flexDirection={"column"}
              >
                {v.primaryPrice ? (
                  <Typography color="primary" fontWeight={600}>
                    {v.primaryPrice}
                  </Typography>
                ) : (
                  <Typography color="primary" fontWeight={600}>
                    {formatPrice(v.price)}
                  </Typography>
                )}

                {v.secondaryPrice && (
                  <Typography variant="body2" color="grey.500">
                    {v.secondaryPrice}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProductVariantsList;
