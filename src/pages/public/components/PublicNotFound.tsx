import { Box, Typography } from "@mui/material";
import React from "react";

const PublicNotFound: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 4,
      }}
    >
      <Typography variant="h5" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default PublicNotFound;
