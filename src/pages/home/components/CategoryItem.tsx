// src/components/CategoryItem.tsx
import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DeleteIcon from "@mui/icons-material/Delete";
import { ReactComponent as CrownIcon } from "../../../assets/icons/crown.svg";
import categoryIcons from "../../../assets/icons/category/categoryIcons";
import { Category } from "../../../types/category";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Narrow down the screens you actually use:
export type CategoryScreen = "createEdit" | "promotion";

export interface CategoryItemProps {
  cat: Category;
  /** same signature as Formik’s setFieldValue */
  // setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setActiveScreen: (screen: CategoryScreen) => void;
  setOpenDeleteCategoryDialog?: (open: boolean) => void | null | undefined;
  setSelectedCategoryDelete?: (cat: Category) => void | null | undefined;
  isSortable?: boolean;
  isEditable?: boolean;
}
/**
 * Draggable Category Item
 */
const CategoryItem: React.FC<CategoryItemProps> = ({
  cat,
  // setFieldValue,
  setActiveScreen,
  setOpenDeleteCategoryDialog,
  setSelectedCategoryDelete,
  isSortable = false,
  isEditable = true,
}) => {
  const IconComponent = cat.icon ? categoryIcons[cat.icon] : null;
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
      id: cat.id,
      animateLayoutChanges: defaultAnimateLayoutChanges,
    });

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      setActivatorNodeRef(node);
    },
    [setNodeRef, setActivatorNodeRef],
  );
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none", // helps on mobile
  };

  return (
    <Box
      // La fila es el nodo activador: el KeyboardSensor solo inicia un arrastre
      // con teclas pulsadas sobre ella misma, no sobre los IconButton anidados.
      ref={setRefs}
      {...attributes}
      {...listeners}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      height={44}
      pl={1.5}
      pr={3}
      sx={{
        boxShadow: (theme) => `0px 1px 0px ${theme.palette.border.layout}`,
        ...style,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        {isSortable && (
          <Typography variant="body2" sx={{ cursor: "grab", display: "flex" }}>
            <DragIndicatorIcon />
          </Typography>
        )}
        <Box
          sx={{
            backgroundColor: "grey.400",
            p: 2,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {IconComponent ? (
            <IconComponent width={18} height={18} />
          ) : (
            <CrownIcon width={18} height={18} />
          )}
        </Box>
        <Typography
          sx={{ cursor: "pointer", fontSize: 14, color: "text.body" }}
          // onClick={() => {
          //   setFieldValue("editingCategoryId", cat.id);
          //   setFieldValue("newCategoryName", cat.label);
          //   setFieldValue("newCategoryIcon", cat.icon);
          //   setActiveScreen("createEdit");
          // }}
        >
          {cat.label}
        </Typography>
      </Box>

      {isEditable && (
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton aria-label="Configurar promoción de la categoría" size="small" onClick={() => setActiveScreen("promotion")}>
            <LocalOfferIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Eliminar categoría"
            size="small"
            onClick={() => {
              setSelectedCategoryDelete && setSelectedCategoryDelete(cat);
              setOpenDeleteCategoryDialog && setOpenDeleteCategoryDialog(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default CategoryItem;
