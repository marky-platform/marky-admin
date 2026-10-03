import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import CollectionsIcon from "@mui/icons-material/Collections";
import { Box, Typography } from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";
import ImageCropModal from "../../../components/ImageCropModal";
import { useImageCropper } from "../../../hooks/useImageCropper";
import { Product } from "../../../types/product";
import { validateMedia } from "../../../utils/mediaValidation";
import { ShowNotification } from "../../../utils/utils";
import MediaTile from "./MediaTile";

interface ProductImageGalleryProps {
  // Both optional and only used to restyle the existing global upload
  // progress signal onto whichever tile(s) hold a pending (not-yet-saved)
  // File — no new per-file upload pipeline.
  uploadProgress?: number | null;
  isSaving?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  uploadProgress = null,
  isSaving = false,
}) => {
  const { values, setFieldValue } = useFormikContext<Product>();
  const { media = [] } = values;
  const [activeMediaId, setActiveMediaId] = React.useState<string | number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const {
    crop,
    zoom,
    croppingMedia,
    imageUrl,
    setCrop,
    setZoom,
    handleCropComplete,
    handleOpenCropModal,
    handleCloseCropModal,
    handleApplyCrop,
    handleZoomChange,
  } = useImageCropper((croppedImage) => {
    if (activeMediaId !== null) {
      handleCrop(activeMediaId, croppedImage);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files) return;

      const newMedia = Array.from(files);
      const activeMedia = media.filter((m) => !m._delete);
      const validationError = validateMedia(newMedia, activeMedia);
      if (validationError) {
        ShowNotification({ message: validationError, type: "error" });
        return;
      }

      const newItems = newMedia.map((file, index) => ({
        id: Date.now() + index,
        file: file,
        originalFile: file,
        name: file.name,
        media_type: file.type.startsWith("image/") ? "image" : "video",
        product: 0,
        isNew: true,
      }));

      setFieldValue("media", [...media, ...newItems]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error en handleFileChange:", error);
      ShowNotification({
        message: "Error al procesar los archivos",
        type: "error",
      });
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    try {
      const { active, over } = event;
      if (!over) return;
      if (active.id !== over.id) {
        const oldIndex = media.findIndex(
          (item: any) => item.id.toString() === String(active.id),
        );
        const newIndex = media.findIndex(
          (item: any) => item.id.toString() === String(over.id),
        );
        if (oldIndex === -1 || newIndex === -1) return;
        const newItems = arrayMove(media, oldIndex, newIndex);
        setFieldValue(
          "media",
          newItems.map((item: any, index: number) => ({
            ...item,
            order: index,
          })),
        );
      }
    } catch (error) {
      console.error("Error en handleDragEnd:", error);
    }
  }

  const handleDelete = (id: string | number) => {
    const newMedia = media
      .map((item: any) => {
        if (item.id === Number(id)) {
          if (item.isNew) {
            return null; // remove new uploads entirely
          }
          return { ...item, _delete: true }; // mark backend items as deleted
        }
        return item;
      })
      .filter(Boolean);

    setFieldValue("media", newMedia);
  };

  const handleCrop = (id: string | number, file: File) => {
    const newMedia = media.map((item: any) => {
      if (item.id.toString() === id.toString()) {
        return { ...item, file: file, name: file.name };
      }
      return item;
    });
    setFieldValue("media", newMedia);
  };

  const handleOpenCropModalWithId = (id: string | number) => {
    const mediaToCrop = media.find(
      (item: any) => item.id.toString() === id.toString(),
    );
    if (mediaToCrop) {
      setActiveMediaId(id);
      const fileToCrop = mediaToCrop.originalFile || mediaToCrop.file;
      handleOpenCropModal(fileToCrop);
    }
  };

  const activeMedia = media.filter((item: any) => !item._delete);
  const images = activeMedia.filter((item: any) => item.media_type === "image");
  const video = activeMedia.find((item: any) => item.media_type === "video");

  // Per-tile caption while the whole payload is mid-upload (Publish click),
  // shown only on tiles holding a pending (unsaved) File — restyles the
  // existing global uploadProgress signal, no new per-file upload logic.
  const captionFor = (item: any) => {
    if (!isSaving || !item?.isNew) return undefined;
    if (uploadProgress === null) return "Procesando...";
    return `Subiendo...${uploadProgress}%`;
  };

  const imageSlots = [0, 1, 2].map((slotIndex) => images[slotIndex] ?? null);

  return (
    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, padding: 5 }}>
      <ImageCropModal
        open={!!croppingMedia}
        onClose={handleCloseCropModal}
        onApply={handleApplyCrop}
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={handleCropComplete}
        handleZoomChange={handleZoomChange}
      />
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <CollectionsIcon />
        <Typography variant="h6" fontWeight="bold">
          Imágenes y video del producto
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Agrega hasta 3 imágenes y 1 video para presentar mejor tu producto.
      </Typography>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={images.map((item: any) => item.id.toString())}
          strategy={horizontalListSortingStrategy}
        >
          <Box display="flex" gap={6}>
            {imageSlots.map((item, index) =>
              item ? (
                <MediaTile
                  key={String(item.id)}
                  id={String(item.id)}
                  kind="image"
                  filled
                  sortable
                  isCover={index === 0}
                  file={item.file}
                  caption={captionFor(item)}
                  onDelete={() => handleDelete(String(item.id))}
                  onCrop={() => handleOpenCropModalWithId(String(item.id))}
                />
              ) : (
                <MediaTile
                  key={`empty-image-${index}`}
                  id={`empty-image-${index}`}
                  kind="image"
                  filled={false}
                  onAdd={() => fileInputRef.current?.click()}
                />
              ),
            )}
            {video ? (
              <MediaTile
                key={String(video.id)}
                id={String(video.id)}
                kind="video"
                filled
                file={video.file}
                caption={captionFor(video)}
                onDelete={() => handleDelete(String(video.id))}
              />
            ) : (
              <MediaTile
                key="empty-video"
                id="empty-video"
                kind="video"
                filled={false}
                onAdd={() => fileInputRef.current?.click()}
              />
            )}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

export default ProductImageGallery;
