import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  defaultAnimateLayoutChanges,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

export interface SortableListItem {
  id: string | number;
}

interface SortableListProps<T extends SortableListItem> {
  items: T[];
  /** Content of one row; the whole row is the drag target. */
  renderItem: (item: T) => React.ReactNode;
  /** Rendered above the sortable rows and not draggable (e.g. pinned items). */
  pinnedContent?: React.ReactNode;
  hint?: string;
  emptyMessage?: string;
  /** Receives the items in their new order. */
  onSave: (orderedItems: T[]) => void;
  isSaving?: boolean;
}

interface SortableRowProps {
  id: string | number;
  children: React.ReactNode;
}

const SortableRow: React.FC<SortableRowProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, animateLayoutChanges: defaultAnimateLayoutChanges });

  return (
    <Box
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      sx={{
        boxShadow: "0px 1px 0px #E8E9EB",
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none", // helps on mobile
        cursor: "grab",
      }}
    >
      {children}
    </Box>
  );
};

/**
 * Generic drag-and-drop list with a "Guardar" footer. Guardar stays disabled
 * until the order differs from the one the list mounted with, which also
 * covers lists of 0 or 1 items.
 */
function SortableList<T extends SortableListItem>({
  items,
  renderItem,
  pinnedContent,
  hint = "Selecciona y arrastra para ordenar",
  emptyMessage = "No hay elementos para ordenar.",
  onSave,
  isSaving = false,
}: SortableListProps<T>) {
  const [initialIds] = useState(() => items.map((item) => item.id));
  const [localItems, setLocalItems] = useState(items);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const hasChanges = useMemo(
    () => localItems.some((item, index) => item.id !== initialIds[index]),
    [localItems, initialIds],
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setLocalItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const isEmpty = localItems.length === 0 && !pinnedContent;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        <ImportExportIcon />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#333" }}>
          {hint}
        </Typography>
      </Box>

      <Box
        sx={{
          maxHeight: 360,
          overflowY: "auto",
          border: 1,
          borderColor: "#E0E0E0",
          py: 0.25,
          borderRadius: 1.5,
        }}
      >
        {pinnedContent}
        <SortableContext
          items={localItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {localItems.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableRow>
          ))}
        </SortableContext>
        {isEmpty && (
          <Typography variant="body2" color="textSecondary" p={2}>
            {emptyMessage}
          </Typography>
        )}
      </Box>

      <Box mt={4} pt={3} sx={{ boxShadow: "0px -1px 0px #E8E9EB" }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onSave(localItems)}
          disabled={!hasChanges || isSaving}
          startIcon={
            isSaving ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{ boxShadow: 0 }}
        >
          Guardar
        </Button>
      </Box>
    </DndContext>
  );
}

export default SortableList;
