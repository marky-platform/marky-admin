import { Box, Link as MuiLink, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../../routes/paths";
import { AnalyticsPulse } from "../../../../types/analytics";
import { formatCount, formatDuration } from "./format";
import { Section } from "./sectionStyles";

const TopProducts = ({ pulse }: { pulse: AnalyticsPulse }) => (
  <Section title="Productos más vistos" caption="Últimos 7 días">
    {pulse.topProducts.length === 0 ? (
      <Typography sx={{ fontSize: 13, color: "text.muted" }}>
        Todavía no hay productos vistos.
      </Typography>
    ) : (
      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0 }}>
        {pulse.topProducts.map((p, index) => (
          <Box
            component="li"
            key={`${p.productId ?? "deleted"}-${index}`}
            sx={{
              display: "grid",
              gridTemplateColumns: "20px minmax(0, 1fr) auto",
              columnGap: 2,
              alignItems: "baseline",
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: 13, color: "text.muted" }}>
              {index + 1}
            </Typography>
            {p.productId !== null ? (
              <MuiLink
                component={RouterLink}
                to={ROUTES.PRODUCT_DETAIL.replace(":id", String(p.productId))}
                underline="hover"
                noWrap
                sx={{ fontSize: 13, color: "text.strong", fontWeight: 500 }}
              >
                {p.name}
              </MuiLink>
            ) : (
              // Producto eliminado: se muestra el nombre guardado, sin enlace.
              <Typography noWrap sx={{ fontSize: 13, color: "text.body" }}>
                {p.name}
              </Typography>
            )}
            <Typography sx={{ fontSize: 12, color: "text.muted", textAlign: "right" }}>
              {formatCount(p.views)} {p.views === 1 ? "vista" : "vistas"} ·{" "}
              {formatDuration(p.averageEngagedSeconds)}
            </Typography>
          </Box>
        ))}
      </Box>
    )}
  </Section>
);

export default TopProducts;
