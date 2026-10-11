import React from "react";
import { Box, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTheme } from "@mui/material/styles";
import { ReactComponent as ParaguayFlagIcon } from "../../../assets/icons/flag-paraguay.svg";
import { ReactComponent as VenezuelaFlagIcon } from "../../../assets/icons/flag-venezuela.svg";

import { Category } from "../../../types/category";

interface CategorySelectionListProps {
  /** Lista de categorías disponibles */
  categories: Category[];
  /** Número máximo de categorías seleccionables */
  maxSelectable: number;
  /** Lista inicial de categorías seleccionadas (opcional) */
  initialSelected?: Category[];
  /** Función a ejecutar al aceptar la selección.
   * Se espera que retorne las categorías seleccionadas.
   */
  selected?: Category[];
  setSelected?: (args: any) => void;
}

const ProductCategorySelectionList: React.FC<CategorySelectionListProps> = ({
  categories,
  maxSelectable,
  selected = [],
  setSelected = () => {},
}) => {
  const theme = useTheme();

  const toggleCategory = (cat: any) => {
    const isSelected = selected.some((item) => item.id === cat.id);
    if (maxSelectable === 1) {
      setSelected(isSelected ? [] : [cat]);
    } else {
      if (isSelected) {
        setSelected((prev: any) =>
          prev.filter((item: any) => item.id !== cat.id)
        );
      } else {
        if (selected.length < maxSelectable) {
          setSelected((prev: any) => [...prev, cat]);
        }
      }
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Lista de categorías */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {categories.map((cat) => {
          const isSelected = selected.some((item) => item.id === cat.id);
          return (
            <Box
              key={cat.id}
              onClick={() => toggleCategory(cat)}
              sx={{
                width: "97%",
                padding: theme.spacing(3),
                borderRadius: 1,
                border: isSelected
                  ? `2px solid ${theme.palette.primary.main}`
                  : "1px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                position: "relative",
                transition: "background-color 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {cat.name === "Paraguay" ? <ParaguayFlagIcon /> : null}
                {cat.name === "Venezuela" ? <VenezuelaFlagIcon /> : null}
                <Typography variant="body2">{cat.name}</Typography>
              </Box>
              {isSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    right: theme.spacing(1),
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon sx={{ color: "primary.contrastText", fontSize: 14 }} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProductCategorySelectionList;
