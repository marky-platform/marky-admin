import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import ModeEditOutline from "@mui/icons-material/ModeEditOutline";
import { Box, IconButton, Typography } from "@mui/material";
import React from "react";
import { ReactComponent as AddImageTileIcon } from "../../../assets/icons/product-form/add-image-tile.svg";
import { ReactComponent as AddVideoTileIcon } from "../../../assets/icons/product-form/add-video-tile.svg";
import { useMediaObjectUrl } from "../../../hooks/useMediaObjectUrl";
import { VideoThumbnail } from "./VideoThumbnail";

interface MediaTileProps {
  // Stable id used for drag-reordering (only meaningful when `sortable`).
  id: string;
  kind: "image" | "video";
  filled: boolean;
  sortable?: boolean;
  isCover?: boolean;
  // Raw file/URL, not a pre-resolved string — MediaTile owns its own object
  // URL lifecycle (via useMediaObjectUrl) so a blob URL isn't recreated on
  // every re-render (e.g. every keystroke elsewhere in the form) and leaked.
  file?: File | Blob | string | null;
  caption?: string;
  onAdd?: () => void;
  onDelete?: () => void;
  onCrop?: () => void;
}

const MediaTile: React.FC<MediaTileProps> = ({
  id,
  kind,
  filled,
  sortable = false,
  isCover = false,
  file,
  caption,
  onAdd,
  onDelete,
  onCrop,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled: !sortable });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const url = useMediaObjectUrl(file);

  if (!filled) {
    const isVideo = kind === "video";
    return (
      <Box sx={{ flex: 1, minWidth: 90 }}>
        <Box
          onClick={onAdd}
          sx={{
            aspectRatio: "1 / 1",
            border: "2px dashed",
            borderColor: isVideo ? "#EE84F8" : "primary.main",
            borderRadius: 3,
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
            {isVideo ? (
              <Box sx={{ width: { xs: 34, md: 48 }, height: { xs: 34, md: 48 } }}>
                <AddVideoTileIcon width="100%" height="100%" />
              </Box>
            ) : (
              <AddImageTileIcon width={34} height={34} />
            )}
            <Typography
              variant="body2"
              fontWeight="bold"
              textAlign="center"
              sx={{ color: isVideo ? "#EE84F8" : "primary.main", lineHeight: "16px" }}
            >
              {isVideo ? (
                <>
                  Agregar
                  <br />
                  Video
                </>
              ) : (
                "Agregar"
              )}
            </Typography>
          </Box>
        </Box>
        {caption && (
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>
            {caption}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      ref={sortable ? setNodeRef : undefined}
      style={sortable ? style : undefined}
      {...(sortable ? attributes : {})}
      sx={{ flex: 1, minWidth: 90 }}
    >
      <Box
        {...(sortable ? listeners : {})}
        sx={{
          position: "relative",
          aspectRatio: "1 / 1",
          border: "1px solid",
          borderColor: "grey.600",
          borderRadius: 3,
          overflow: "hidden",
          cursor: sortable ? "grab" : "default",
          "&:hover .media-tile-actions": { opacity: 1 },
        }}
      >
        {kind === "video" ? (
          <VideoThumbnail url={url || ""} width="100%" height="100%" borderRadius={0} />
        ) : (
          <img
            src={url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        <Box
          className="media-tile-actions"
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            display: "flex",
            gap: 0.5,
            opacity: { xs: 1, md: 0 },
            transition: "opacity 0.15s",
          }}
        >
          {kind === "image" && onCrop && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCrop();
              }}
              sx={{ backgroundColor: "grey.400", borderRadius: 1, p: 0.5 }}
            >
              <ModeEditOutline fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ backgroundColor: "grey.400", borderRadius: 1, p: 0.5 }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
      {isCover ? (
        <Box
          sx={{
            display: "inline-block",
            backgroundColor: "#FFD401",
            borderRadius: "6px",
            px: 1,
            mt: "-12px",
            ml: 1,
            position: "relative",
          }}
        >
          <Typography variant="caption" fontWeight="bold" sx={{ color: "#4B4B4B" }}>
            Imagen de portada
          </Typography>
        </Box>
      ) : (
        caption && (
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={0.5}>
            {caption}
          </Typography>
        )
      )}
    </Box>
  );
};

export default MediaTile;
