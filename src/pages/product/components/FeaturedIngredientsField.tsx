import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import {
  Box,
  FormHelperText,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  addFeaturedIngredient,
  MAX_FEATURED_INGREDIENTS,
  MAX_INGREDIENT_LENGTH,
} from "../../../utils/productExtras";
import RemovableTag from "./RemovableTag";

interface FeaturedIngredientsFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
}

// Pills de ingredientes + control "+" que abre un input inline para agregar uno.
// Enter o el check confirman; Escape cancela.
const FeaturedIngredientsField = ({
  value,
  onChange,
}: FeaturedIngredientsFieldProps) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | undefined>();
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasAdding = useRef(false);
  const limitReached = value.length >= MAX_FEATURED_INGREDIENTS;

  // Al cerrar el input el foco vuelve al "+" para no perder la posición con el teclado.
  useEffect(() => {
    if (wasAdding.current && !adding) addButtonRef.current?.focus();
    wasAdding.current = adding;
  }, [adding]);

  const close = () => {
    setAdding(false);
    setDraft("");
    setError(undefined);
  };

  const commit = () => {
    if (!draft.trim()) {
      close();
      return;
    }
    const result = addFeaturedIngredient(value, draft);
    if (result.error) {
      setError(result.error);
      return;
    }
    onChange(result.list);
    close();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography
          id="featured-ingredients-label"
          variant="body2"
          fontWeight="bold"
          color="text.primary"
        >
          Ingredientes destacados
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Máx. {MAX_FEATURED_INGREDIENTS}
        </Typography>
      </Box>
      <Typography
        id="featured-ingredients-help"
        variant="body2"
        color="text.disabled"
        sx={{ mt: 2 }}
      >
        Agrega los ingredientes que ayudan a entender mejor el producto. No
        necesitas compartir tu receta completa.
      </Typography>
      <Box
        component="ul"
        aria-labelledby="featured-ingredients-label"
        aria-describedby="featured-ingredients-help"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          listStyle: "none",
          p: 0,
          m: 0,
          mt: 2,
        }}
      >
        {value.map((ingredient) => (
          <RemovableTag
            key={ingredient}
            label={ingredient}
            onRemove={() => onChange(value.filter((i) => i !== ingredient))}
          />
        ))}
        {!adding && !limitReached && (
          <li>
            <IconButton
              ref={addButtonRef}
              type="button"
              color="primary"
              aria-label="Agregar ingrediente"
              onClick={() => setAdding(true)}
              sx={{ p: 0.5 }}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </li>
        )}
      </Box>
      {adding && (
        <Box
          sx={{ mt: 2, maxWidth: { xs: "100%", md: 320 } }}
          // Si el foco sale de todo el control con texto escrito, se confirma
          // (igual que antes); moverse al check no cuenta como salir.
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null))
              commit();
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              value={draft}
              placeholder="Ej. Tomate"
              onChange={(e) => {
                setDraft(e.target.value);
                if (error) setError(undefined);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // evita que Enter envíe el formulario completo
                  e.preventDefault();
                  commit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  close();
                }
              }}
              error={Boolean(error)}
              inputProps={{
                "aria-label": "Nuevo ingrediente",
                maxLength: MAX_INGREDIENT_LENGTH + 1,
              }}
            />
            <IconButton
              type="button"
              color="primary"
              aria-label="Confirmar ingrediente"
              onClick={commit}
            >
              <CheckIcon />
            </IconButton>
          </Box>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>
      )}
    </Box>
  );
};

export default FeaturedIngredientsField;
