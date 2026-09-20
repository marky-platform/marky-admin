import React from "react";
import { Box, Chip } from "@mui/material";
import useProductCategories from "../../../hooks/useProductCategories";
import { Category } from "./CategoryFilterModal";

interface CategoryFilterChipsProps {
  values: { categories: Category[] };
  onFilterChange: (newFilters: { categories: Category[] }) => void;
  /** Injected category list (e.g. from the public catalog endpoint) instead
   * of fetching via the authenticated useProductCategories() hook. */
  categories?: Category[];
}

// Mobile-only replacement for the search box / category dropdown / "En
// promoción" checkbox trio used at sm+ (see FilterSection): a horizontally
// scrollable row of category pills, per the mobile Figma frame.
const CategoryFilterChips: React.FC<CategoryFilterChipsProps> = ({
  values,
  onFilterChange,
  categories: injectedCategories,
}) => {
  const { data: categoriesData } = useProductCategories(
    { page_size: 100 },
    { enabled: !injectedCategories },
  );
  const categories = injectedCategories ?? categoriesData?.results ?? [];
  const selectedIds = new Set(values.categories?.map((c) => c.id) ?? []);
  const isAllActive = selectedIds.size === 0;

  const toggleCategory = (category: Category) => {
    const next = selectedIds.has(category.id)
      ? values.categories.filter((c) => c.id !== category.id)
      : [...(values.categories ?? []), category];
    onFilterChange({ categories: next });
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        py: 3,
        px: 4,
        mx: -4,
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Chip
        label={`Todo (${categories.length})`}
        onClick={() => onFilterChange({ categories: [] })}
        sx={{
          flexShrink: 0,
          borderRadius: "40px",
          px: 1,
          py: 2.5,
          fontWeight: 500,
          bgcolor: isAllActive ? "primary.main" : "#E8F3FF",
          color: isAllActive ? "common.white" : "primary.main",
          "&:hover": {
            bgcolor: isAllActive ? "primary.main" : "#E8F3FF",
          },
        }}
      />
      {categories.map((category) => {
        const active = selectedIds.has(category.id);
        return (
          <Chip
            key={category.id}
            label={category.name}
            onClick={() => toggleCategory(category)}
            sx={{
              flexShrink: 0,
              borderRadius: "40px",
              px: 1,
              py: 2.5,
              fontWeight: 500,
              bgcolor: active ? "primary.main" : "#E8F3FF",
              color: active ? "common.white" : "primary.main",
              "&:hover": {
                bgcolor: active ? "primary.main" : "#E8F3FF",
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default CategoryFilterChips;
