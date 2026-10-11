import { Box, Typography } from "@mui/material";
import React from "react";
import { ProductAddon } from "../../../types/product";
import { formatPrice } from "../../../utils/format";

const ProductAddonsList: React.FC<{ addons: ProductAddon[] }> = ({
  addons,
}) => {
  if (!addons || addons.length === 0) return null;

  return (
    <Box sx={{ mt: 0 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Adicionales o extras
      </Typography>

      {/* Each row keeps its own 1px border and rows overlap by 1px (mb: -1px)
          so shared borders don't double up; only the first/last row gets
          rounded corners on that edge, matching the Figma block. */}
      <Box display="flex" flexDirection="column">
        {addons.map((a, index) => {
          // backend might provide formatted labels using snake_case or camelCase
          const primaryLabel =
            (a as any).primaryPrice ?? (a as any).primary_price;
          const secondaryLabel =
            (a as any).secondaryPrice ?? (a as any).secondary_price;
          const isFirst = index === 0;
          const isLast = index === addons.length - 1;

          return (
            <Box
              key={a.id ?? index}
              sx={{
                backgroundColor: "surface.main",
                border: "1px solid",
                borderColor: "grey.400",
                mb: isLast ? 0 : "-1px",
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTopLeftRadius: isFirst ? 12 : 0,
                borderTopRightRadius: isFirst ? 12 : 0,
                borderBottomLeftRadius: isLast ? 12 : 0,
                borderBottomRightRadius: isLast ? 12 : 0,
              }}
            >
              <Typography>{a.name}</Typography>

              <Box
                display="flex"
                alignItems="end"
                flexDirection={"column"}
                gap={1}
              >
                {primaryLabel ? (
                  <Typography color="primary" fontWeight={600}>
                    {primaryLabel}
                  </Typography>
                ) : (
                  <Typography color="primary" fontWeight={600}>
                    {formatPrice(a.price)}
                  </Typography>
                )}

                {secondaryLabel && (
                  <Typography variant="body2" color="grey.500">
                    {secondaryLabel}
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

export default ProductAddonsList;
