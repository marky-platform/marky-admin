// src/components/SortableCategoryList.tsx
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Button, Typography } from "@mui/material";
import { Category } from "../../../types/category";
import CategoryItem, { CategoryScreen } from "./CategoryItem";
import ImportExportIcon from "@mui/icons-material/ImportExport";
interface SortableCategoryListProps {
  categories: Category[];
  onOrderChange: (newOrder: Category[]) => void;
  emptyMessage?: string;
  /** any other props you want to forward to the container */
  // setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setActiveScreen: (screen: CategoryScreen) => void;
  setOpenDeleteCategoryDialog?: (open: boolean) => void;
  setSelectedCategoryDelete?: (cat: Category) => void;
  isSortable?: boolean;
  isEditable?: boolean;
}

const SortableCategoryList: React.FC<SortableCategoryListProps> = ({
  categories,
  onOrderChange,
  emptyMessage = "No hay categorías creadas.",
  // setFieldValue,
  setActiveScreen,
  setOpenDeleteCategoryDialog,
  setSelectedCategoryDelete,
  isSortable,
  isEditable,
}) => {
  const [localCategories, setLocalCategories] = useState(categories);
  const sensors = useSensors(useSensor(PointerSensor));
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Handler for the DnD “drag end” event.
   * Computes the new array order when an item is dropped onto another,
   * reindexes each item’s `order` property, and emits the updated list.
   *
   * @param event - the DnD-Kit DragEndEvent payload
   *   - `event.active.id`   — the ID of the item you just dragged
   *   - `event.over?.id`    — the ID of the item you dropped it over (or `null`)
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // 1️⃣ If you didn’t actually drop onto another item, bail out early.
    if (!over || active.id === over.id) return;

    // 2️⃣ Find the “from” and “to” indexes in your categories array.
    const oldIndex = localCategories.findIndex((c) => c.id === active.id);
    const newIndex = localCategories.findIndex((c) => c.id === over.id);

    // 3️⃣ Create a brand-new ordered array:
    //    - arrayMove(...) shifts the dragged item from oldIndex → newIndex
    //    - .map(...) reassigns each item’s `order` property to its new array index
    const reordered = arrayMove(localCategories, oldIndex, newIndex).map(
      (cat, idx) => ({ ...cat, order: idx }),
    );

    // 4️⃣ Notify parent / save to state / API
    setLocalCategories(reordered);
    // ✅ Check if new order differs from original
    const isDifferent = reordered.some(
      (item, index) => item.id !== categories[index]?.id,
    );
    setHasChanges(isDifferent);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localCategories.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <Box display={"flex"} alignItems={"center"} mb={3} gap={1}>
          <ImportExportIcon />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.strong" }}>
            Selecciona y arrastra la categoría
          </Typography>
        </Box>

        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            border: 1,
            borderColor: "border.field",
            py: 0.25,
            borderRadius: 1.5,
          }}
        >
          {localCategories.length > 0 ? (
            localCategories.map((cat) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                setActiveScreen={setActiveScreen}
                isSortable={isSortable}
                isEditable={isEditable}
              />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              {emptyMessage}
            </Typography>
          )}
        </Box>
      </SortableContext>
      <Box mt={4} pt={3} sx={{ boxShadow: (theme) => `0px -1px 0px ${theme.palette.border.layout}` }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onOrderChange(localCategories)}
          disabled={!hasChanges}
          sx={{ boxShadow: 0 }}
        >
          Guardar
        </Button>
      </Box>
    </DndContext>
  );
};

export default SortableCategoryList;
