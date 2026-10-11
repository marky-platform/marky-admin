import React from "react";
import { Box } from "@mui/material";
import { PlayCircleOutline } from "@mui/icons-material";

interface VideoThumbnailProps {
  url: string;
  width: number | string;
  height: number | string;
  borderRadius?: number;
  border?: string;
}

export const VideoThumbnail = ({
  url,
  width,
  height,
  borderRadius = 4,
  border = "none",
}: VideoThumbnailProps) => {
  return (
    <Box
      sx={{
        position: "relative",
        width,
        height,
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        display: "flex",
        border,
        borderColor: "primary.main",
        boxSizing: "border-box",
        // Dark fallback so the (white) play icon stays visible before the
        // video element has decoded a first frame to show, instead of
        // rendering white-on-white and looking blank. This app's `grey.900`
        // token (#9E9EA6) is too light for that purpose, so use the fixed
        // dark fallback (#4B4B4B in every color scheme).
        backgroundColor: "fixed.mediaFallback",
      }}
    >
      <video
        src={url}
        muted
        preload="metadata"
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <PlayCircleOutline
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "fixed.white",
          fontSize: "1.5rem",
        }}
      />
    </Box>
  );
};
