import { withInsetSurface } from "../../../themes/InsetSurface";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import XButton from "../../../components/XButton";
import { Category } from "../../../types/category";
import useProductCategories from "../../../hooks/useProductCategories";
import { ProductCategory } from "../../../services/productService";
import ProductCategorySelectionList from "./ProductCategorySelectionList";

interface AssignCategoryModalProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: Category | null;
  // Accept null to keep the API flexible, but the modal will only call
  // this when the user explicitly assigns a category using the button.
  onSelectCategory: (category: Category | null) => void;
}

const AssignCategoryModalContent: React.FC<AssignCategoryModalProps> = ({
  open,
  onClose,
  selectedCategory,
  onSelectCategory,
}) => {
  const { data: categoriesData } = useProductCategories(
    {
      include_products: false,
    },
    { enabled: open },
  );
  const [categories, setCategories] = useState<Category[]>([]);
  // const [selectedCategory, setSelectedCategory] = useState<Category | null>(
  //   null
  // );
  const [searchTerm, setSearchTerm] = useState("");
  // Local temporary selection: clicking items updates this local state
  // and does NOT immediately propagate to the parent. Only when the
  // user clicks "Asignar categoría" will we call onSelectCategory.
  const [tempSelectedCategory, setTempSelectedCategory] =
    useState<Category | null>(selectedCategory ?? null);

  // Initialize temp selection whenever modal is opened or the parent
  // selectedCategory changes (useful when editing an existing product).
  useEffect(() => {
    if (open) {
      setTempSelectedCategory(selectedCategory ?? null);
    }
  }, [open, selectedCategory]);

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAssignCategory = () => {
    // Only assign when there's a temporary selection. The parent will
    // take care of updating its state and closing the modal.
    if (tempSelectedCategory) {
      onSelectCategory(tempSelectedCategory);
    }
  };

  useEffect(() => {
    if (categoriesData) {
      const mappedCategories: Category[] = categoriesData.results.map(
        (cat: ProductCategory) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          order: 0,
        }),
      );
      setCategories(mappedCategories);
    }
  }, [categoriesData]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.border.field}`,
        }}
      >
        <DialogTitle sx={{ px: 2, py: 0 }}>Asignar categoría</DialogTitle>
        <XButton onClick={onClose} />
      </Box>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography variant="h6">
            Seleccione la categoría para su producto
          </Typography>
          <TextField
            fullWidth
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <Box sx={{ maxHeight: 300, overflowY: "auto", mt: 2 }}>
            <ProductCategorySelectionList
              categories={filteredCategories}
              maxSelectable={1}
              // show the local temporary selection inside the modal
              selected={tempSelectedCategory ? [tempSelectedCategory] : []}
              // update only local state when user toggles options
              setSelected={(cats: Category[]) =>
                setTempSelectedCategory(cats[0] || null)
              }
            />
          </Box>
        </Box>
      </DialogContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          p: 2,
          borderTop: (theme) => `1px solid ${theme.palette.border.field}`,
        }}
      >
        <Button onClick={onClose} variant="outlined" sx={{ px: 3 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleAssignCategory}
          variant="contained"
          disabled={!tempSelectedCategory}
          sx={{ px: 3 }}
        >
          Asignar categoría
        </Button>
      </Box>
    </Dialog>
  );
};

export const AssignCategoryModal = withInsetSurface(
  AssignCategoryModalContent
);

export default AssignCategoryModal;
