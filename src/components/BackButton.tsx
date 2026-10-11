import React from "react";
import { styled, IconButtonProps } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const GreyHoverButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: "transparent",
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
  },
  borderRadius: 5,
}));

// Extend IconButtonProps so our component inherits all the props
interface BackButtonProps extends IconButtonProps {}

const BackButton: React.FC<BackButtonProps> = (props) => {
  return (
    <GreyHoverButton {...props}>
      <ArrowBackIcon sx={{ color: "text.black" }} />
    </GreyHoverButton>
  );
};

export default BackButton;
