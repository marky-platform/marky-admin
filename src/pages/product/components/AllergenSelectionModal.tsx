import GrainIcon from "@mui/icons-material/Grain";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useRef, useState } from "react";
import CancelButton from "../../../components/CancelButton";
import XButton from "../../../components/XButton";
import { ALLERGEN_ICONS } from "../../../constants/allergenIcons";
import { ALLERGENS } from "../../../constants/allergens";
import { normalizeSearch } from "../../../utils/normalizeSearch";

interface AllergenSelectionModalProps {
  open: boolean;
  selected: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

// Los cambios son locales hasta confirmar; cancelar/cerrar los descarta.
const AllergenSelectionModal = ({
  open,
  selected,
  onClose,
  onConfirm,
}: AllergenSelectionModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [draft, setDraft] = useState<string[]>(selected);
  const [search, setSearch] = useState("");

  // Cada vez que se abre, parte de la selección guardada en el formulario. Solo
  // depende de `open`: un re-render del padre con otra referencia de `selected`
  // no debe pisar los cambios sin confirmar.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  useEffect(() => {
    if (open) {
      setDraft(selectedRef.current);
      setSearch("");
    }
  }, [open]);

  const visible = useMemo(() => {
    const term = normalizeSearch(search);
    return ALLERGENS.filter(
      (a) => !term || normalizeSearch(a.label).includes(term),
    );
  }, [search]);

  const toggle = (id: string) =>
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      aria-labelledby="allergen-modal-title"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          borderBottom: "1px solid lightgrey",
        }}
      >
        <DialogTitle id="allergen-modal-title">Alérgenos</DialogTitle>
        <XButton
          aria-label="Cerrar"
          onClick={onClose}
          sx={{
            marginRight: 2,
            bgcolor: "grey.400",
            "&:hover": { bgcolor: "grey.400" },
          }}
        />
      </Box>
      <DialogContent sx={isMobile ? { flex: 1 } : { maxHeight: "80vh" }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          inputProps={{ "aria-label": "Buscar alérgeno por nombre" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2, mb: 4 }}
        />
        <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 3 }}>
          Selecciona los alérgenos que están presentes en el producto
        </Typography>
        <List disablePadding>
          {visible.map((allergen) => {
            const checked = draft.includes(allergen.id);
            return (
              <ListItem key={allergen.id} disablePadding sx={{ mb: 2 }}>
                <ListItemButton
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={allergen.label}
                  onClick={() => toggle(allergen.id)}
                  selected={checked}
                  sx={{
                    // El estado seleccionado se marca con borde primario y un
                    // check a la derecha (sin checkbox a la izquierda).
                    border: "2px solid",
                    borderColor: checked ? "primary.main" : "transparent",
                    borderRadius: "6px",
                    px: 4,
                    py: 3,
                    "&.Mui-selected": { bgcolor: "background.default" },
                    "&:hover, &.Mui-selected:hover": { bgcolor: "grey.50" },
                    "&.Mui-focusVisible, &.Mui-selected.Mui-focusVisible": {
                      bgcolor: "grey.50",
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 2,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {ALLERGEN_ICONS[allergen.id] ? (
                      <Box
                        component="img"
                        src={ALLERGEN_ICONS[allergen.id]}
                        alt=""
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <GrainIcon aria-hidden color="disabled" />
                    )}
                  </Box>
                  <ListItemText
                    primary={allergen.label}
                    secondary={allergen.description}
                  />
                  {checked && (
                    <CheckCircleIcon
                      aria-hidden
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
          {visible.length === 0 && (
            <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
              No se encontraron alérgenos
            </Box>
          )}
        </List>
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: "1px solid lightgrey",
          display: "flex",
          gap: 2,
          padding: 4,
          flexShrink: 0,
          ...(isMobile && { "& > button": { flex: 1 } }),
        }}
      >
        <CancelButton sx={{ paddingX: 4 }} onClick={onClose}>
          Cancelar
        </CancelButton>
        <Button
          sx={{ paddingX: 4 }}
          variant="contained"
          color="primary"
          onClick={() => onConfirm(draft)}
        >
          Asignar alérgenos
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AllergenSelectionModal;
