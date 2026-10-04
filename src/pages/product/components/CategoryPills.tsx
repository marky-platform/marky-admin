import { Box, Chip, Link, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import useProductCategories from "../../../hooks/useProductCategories";
import { Category } from "../../../types/category";

interface CategoryPillsProps {
  selectedCategory: Category | null;
  onSelect: (category: Category | null) => void;
  onCreateCategory: () => void;
}

// Todas las categorías como pills outlined en una sola fila con scroll
// horizontal. La seleccionada usa el color primario (borde y texto); volver a
// tocarla la deselecciona (la categoría es opcional en el dominio).
const CategoryPills = ({
  selectedCategory,
  onSelect,
  onCreateCategory,
}: CategoryPillsProps) => {
  const { data } = useProductCategories(
    { include_products: false },
    { enabled: true },
  );
  const categories = data?.results ?? [];
  const activeRef = useRef<HTMLDivElement | null>(null);

  // Una categoría recién creada se agrega al final de la fila: se trae a la vista.
  useEffect(() => {
    activeRef.current?.scrollIntoView?.({
      inline: "nearest",
      block: "nearest",
    });
  }, [selectedCategory?.id, categories.length]);

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: 2,
        }}
      >
        <Typography
          id="product-category-label"
          variant="body2"
          fontWeight="bold"
          color="text.primary"
        >
          Categoría del producto
        </Typography>
        <Link
          component="button"
          type="button"
          variant="body2"
          fontWeight="bold"
          onClick={onCreateCategory}
          underline="hover"
        >
          Crear nueva categoría
        </Link>
      </Box>
      <Typography
        id="product-category-help"
        variant="body2"
        color="text.disabled"
        sx={{ mt: 2 }}
      >
        Selecciona dónde quieres organizar este producto.
      </Typography>
      <Box
        role="group"
        aria-labelledby="product-category-label"
        aria-describedby="product-category-help"
        sx={{
          display: "flex",
          gap: 1.5,
          overflowX: "auto",
          flexWrap: "nowrap",
          py: 1,
          mt: 1,
          pr: 6,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {categories.map((category) => {
          const active = String(selectedCategory?.id) === String(category.id);
          return (
            <Chip
              key={category.id}
              ref={active ? activeRef : undefined}
              label={category.name}
              variant="outlined"
              color={active ? "primary" : "default"}
              clickable
              aria-pressed={active}
              onClick={() =>
                onSelect(
                  active
                    ? null
                    : {
                        id: category.id,
                        name: category.name,
                        icon: category.icon,
                        order: 0,
                      },
                )
              }
              sx={{
                flexShrink: 0,
                height: 40,
                borderRadius: "40px",
                px: 1,
                bgcolor: "background.default",
                // el estado no seleccionado usa el gris de bordes de inputs del tema
                borderColor: active ? "primary.main" : "grey.800",
                color: active ? "primary.main" : "text.primary",
                "&:hover": { bgcolor: "grey.50" },
                "& .MuiChip-label": { fontSize: 12 },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default CategoryPills;
