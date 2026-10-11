import { Box, Typography, Button } from "@mui/material";
import CreateCategoriesEmptyImage from "../../../../assets/images/create-categories-empty.png";

type ActiveScreen = "welcome" | "main" | "sort" | "createEdit" | "promotion";

interface WelcomeProps {
  setActiveScreen: (screen: ActiveScreen) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ setActiveScreen }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      gap={6.5}
      py={5.5}
    >
      <Box
        component="img"
        src={CreateCategoriesEmptyImage}
        alt="Crea tus categorías"
        sx={{ width: 272, height: 272 }}
      />
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography sx={{ fontSize: 16, fontWeight: 500, color: "text.heading" }}>
          Crea tus categorías
        </Typography>
        <Typography sx={{ fontSize: 14, color: "text.muted" }}>
          Organiza tus productos relacionados
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setActiveScreen("createEdit")}
        sx={{ width: 221, boxShadow: 0 }}
      >
        Crear categoría
      </Button>
    </Box>
  );
};
