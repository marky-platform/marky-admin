import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

const CancelButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.black, // texto negro
  backgroundColor: theme.palette.grey[200], // gris claro
  boxShadow: "none",
  textTransform: "none",
  "&:hover": {
    backgroundColor: theme.palette.grey[300], // un gris un poco más oscuro al pasar el mouse
    boxShadow: "none",
  },
}));

export default CancelButton;
