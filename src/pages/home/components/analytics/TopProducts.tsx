import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../../routes/paths";
import { AnalyticsProductSort, AnalyticsPulse } from "../../../../types/analytics";
import { formatCount, formatSeconds } from "./format";
import { BlockHeader, PulseSelect, pulseText } from "./sectionStyles";

const SORT_OPTIONS: { value: AnalyticsProductSort; label: string }[] = [
  { value: "views", label: "Más vistos" },
  { value: "time", label: "Más tiempo" },
];

type Product = AnalyticsPulse["topProducts"][number];

/** Miniatura 44px: primera imagen del producto o su inicial sobre fondo celeste. */
const ProductThumb = ({ product }: { product: Product }) => (
  <Box
    aria-hidden
    sx={{
      width: 44,
      height: 44,
      borderRadius: 3,
      flexShrink: 0,
      overflow: "hidden",
      bgcolor: "secondary.main",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {product.image ? (
      <Box component="img" data-testid="product-thumb" src={product.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
    ) : (
      <Typography sx={{ ...pulseText.lead, fontSize: 18, color: "primary.main" }}>
        {product.name.trim().charAt(0).toUpperCase() || "?"}
      </Typography>
    )}
  </Box>
);

/** "Productos que atraen": ranking por vistas o por tiempo promedio. */
const TopProducts = ({
  pulse,
  sort,
  onSortChange,
}: {
  pulse: AnalyticsPulse;
  sort: AnalyticsProductSort;
  onSortChange: (sort: AnalyticsProductSort) => void;
}) => (
  <Box component="section" sx={{ width: "100%" }}>
    <BlockHeader
      title="Productos que atraen"
      subtitle={sort === "time" ? "Ordenados por tiempo promedio" : "Ordenados por vistas"}
      action={
        <PulseSelect value={sort} options={SORT_OPTIONS} onChange={onSortChange} ariaLabel="Ordenar productos" />
      }
    />
    {pulse.topProducts.length === 0 ? (
      <Typography sx={{ ...pulseText.tiny, color: "pulse.muted", px: "2px", pt: 3 }}>
        Todavía no hay productos vistos.
      </Typography>
    ) : (
      <Box component="ol" sx={{ listStyle: "none", m: 0, px: "2px", pt: 3 }}>
        {pulse.topProducts.map((p, index) => (
          <Box
            component="li"
            key={`${p.productId ?? "deleted"}-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              py: "14px",
              borderTop: index ? (t) => `1px solid ${t.palette.pulse.divider}` : "none",
            }}
          >
            <Typography sx={{ ...pulseText.tinyMedium, color: "pulse.muted", width: 16, flexShrink: 0 }}>
              {String(index + 1).padStart(2, "0")}
            </Typography>
            <ProductThumb product={p} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {p.productId !== null ? (
                <MuiLink
                  component={RouterLink}
                  to={ROUTES.PRODUCT_DETAIL.replace(":id", String(p.productId))}
                  underline="hover"
                  noWrap
                  display="block"
                  sx={{ ...pulseText.p, color: "pulse.ink" }}
                >
                  {p.name}
                </MuiLink>
              ) : (
                // Producto eliminado: se muestra el nombre guardado, sin enlace.
                <Typography noWrap sx={{ ...pulseText.p, color: "pulse.ink" }}>
                  {p.name}
                </Typography>
              )}
              <Typography noWrap sx={{ ...pulseText.tiny, color: "pulse.muted", pt: "2px" }}>
                {formatSeconds(p.averageEngagedSeconds)} de tiempo promedio
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography sx={{ ...pulseText.h2, color: "pulse.ink" }}>{formatCount(p.views)}</Typography>
              <Typography sx={{ ...pulseText.tiny, color: "pulse.muted" }}>
                {p.views === 1 ? "vista" : "vistas"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    )}
  </Box>
);

export default TopProducts;
