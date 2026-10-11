import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import XButton from "../../../components/XButton";
import useProductCategories from "../../../hooks/useProductCategories";
import { useMoveProductToCategory } from "../../../hooks/useProductMutations";
import { ProductGridItem } from "../../../types/product";
import { CreateEdit } from "../../home/components/categoryAdminModalScreens/CreateEdit";

export interface MoveToCategoryModalCurrentCategory {
  id: number | null;
  name: string;
}

interface MoveToCategoryModalProps {
  open: boolean;
  onClose: () => void;
  product: ProductGridItem | null;
  currentCategory: MoveToCategoryModalCurrentCategory | null;
}

interface CategoryRow {
  id: number | null;
  name: string;
}

const SIN_CATEGORIA_ROW: CategoryRow = { id: null, name: "Sin categoría" };

const MoveToCategoryModal: React.FC<MoveToCategoryModalProps> = ({
  open,
  onClose,
  product,
  currentCategory,
}) => {
  // "list" shows the categories to move into; "create" embeds the existing
  // category-creation form so the user can create one without leaving this
  // flow, then comes back to "list" to actually move the product into it.
  const [mode, setMode] = useState<"list" | "create">("list");
  const { data: categoriesData } = useProductCategories(
    { include_products: false },
    { enabled: open },
  );
  const moveToCategory = useMoveProductToCategory();

  const rows: CategoryRow[] = [
    SIN_CATEGORIA_ROW,
    ...(categoriesData?.results ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
    })),
  ];

  const handleClose = () => {
    setMode("list");
    onClose();
  };

  const handleMove = (row: CategoryRow) => {
    if (!product) return;
    moveToCategory.mutate(
      { id: Number(product.id), categoryId: row.id, categoryName: row.name },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.border.field}`,
        }}
      >
        <DialogTitle sx={{ px: 2, py: 0 }}>
          {mode === "create"
            ? "Crear nueva categoría"
            : "Mover producto a categoría"}
        </DialogTitle>
        <XButton onClick={handleClose} />
      </Box>
      <DialogContent>
        {mode === "create" ? (
          <Box sx={{ my: 2 }}>
            <Button onClick={() => setMode("list")} sx={{ mb: 2 }}>
              ‹ Volver
            </Button>
            <CreateEdit onSubmit={() => setMode("list")} />
          </Box>
        ) : (
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Selecciona la categoría donde quieres ubicar este producto.
            </Typography>
            <Box
              sx={{
                maxHeight: 320,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {rows.map((row) => {
                const isCurrent =
                  (row.id ?? null) === (currentCategory?.id ?? null);
                return (
                  <Box
                    key={row.id ?? "sin-categoria"}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200",
                    }}
                  >
                    <Typography variant="body2">{row.name}</Typography>
                    {isCurrent ? (
                      <Typography variant="caption" color="text.secondary">
                        Categoría actual
                      </Typography>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={moveToCategory.isPending}
                        onClick={() => handleMove(row)}
                        sx={{ px: 2 }}
                      >
                        Mover aquí
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
            <Button
              onClick={() => setMode("create")}
              sx={{ mt: 3 }}
              variant="text"
            >
              + Crear nueva categoría
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MoveToCategoryModal;
