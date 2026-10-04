import { Box, Typography } from "@mui/material";
import React from "react";
import allergensBadge from "../../../assets/icons/product-detail/allergens-badge.svg";
import celiacBadge from "../../../assets/icons/product-detail/celiac-badge.svg";
import { Product } from "../../../types/product";
import {
  getAllergenLabels,
  getCeliacDeclarations,
} from "../../../utils/productDetailFormat";
import InfoPill, { InfoPillList } from "./InfoPill";

interface FoodRowProps {
  icon: string;
  title: string;
  pills: string[];
  pillsLabel: string;
  divider?: boolean;
}

const FoodRow: React.FC<FoodRowProps> = ({
  icon,
  title,
  pills,
  pillsLabel,
  divider,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 3,
      px: 3,
      py: 4.5,
      borderTop: divider ? "1px solid" : "none",
      borderColor: "grey.400",
    }}
  >
    <Box
      component="img"
      src={icon}
      alt=""
      sx={{ width: 40, height: 40, flexShrink: 0 }}
    />
    <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ lineHeight: "18px" }}>
        {title}
      </Typography>
      {pills.length > 0 && (
        <InfoPillList label={pillsLabel}>
          {pills.map((pill) => (
            <InfoPill key={pill} label={pill} />
          ))}
        </InfoPillList>
      )}
    </Box>
  </Box>
);

// "Información alimentaria": alérgenos presentes + declaración SIN TACC.
// Cada fila se oculta si no hay datos; sin ninguna, no se muestra la sección.
const ProductFoodInfo: React.FC<{ product: Product }> = ({ product }) => {
  const allergens = getAllergenLabels(product.allergens);
  const celiacEnabled = Boolean(product.celiacInfo);
  const declarations = getCeliacDeclarations(product.celiacInfo);

  if (allergens.length === 0 && !celiacEnabled) return null;

  return (
    <Box component="section" aria-labelledby="product-food-info-title">
      <Typography
        id="product-food-info-title"
        variant="h5"
        fontWeight={700}
        mb={2}
      >
        Información alimentaria
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "grey.400",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        {allergens.length > 0 && (
          <FoodRow
            icon={allergensBadge}
            title="Alérgenos presentes"
            pills={allergens}
            pillsLabel="Alérgenos presentes"
          />
        )}
        {celiacEnabled && (
          <FoodRow
            icon={celiacBadge}
            title="Apto para celíacos (SIN TACC)"
            pills={declarations}
            pillsLabel="Declaraciones SIN TACC"
            divider={allergens.length > 0}
          />
        )}
      </Box>
      <Typography variant="body2" mt={1}>
        Información declarada por el negocio.
      </Typography>
    </Box>
  );
};

export default ProductFoodInfo;
