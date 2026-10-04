import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import allergenInfoIcon from "../../../assets/icons/product-form/allergen-info.svg";
import { ALLERGENS } from "../../../constants/allergens";
import AllergenSelectionModal from "./AllergenSelectionModal";
import RemovableTag from "./RemovableTag";

interface AllergensSectionProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

const AllergensSection = ({ value, onChange }: AllergensSectionProps) => {
  const [open, setOpen] = useState(false);
  const selected = ALLERGENS.filter((a) => value.includes(a.id));

  return (
    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 5, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Box
          component="img"
          src={allergenInfoIcon}
          alt=""
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="h6" fontWeight="bold">
          Alérgenos
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Opcional
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mt: 2.5 }}>
        Selecciona los alérgenos presentes en este producto.
      </Typography>
      {selected.length > 0 && (
        <Box
          component="ul"
          aria-label="Alérgenos seleccionados"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            listStyle: "none",
            p: 0,
            m: 0,
            mt: 2.5,
          }}
        >
          {selected.map((a) => (
            <RemovableTag
              key={a.id}
              label={a.label}
              onRemove={() => onChange(value.filter((id) => id !== a.id))}
            />
          ))}
        </Box>
      )}
      <Button
        type="button"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        sx={{ display: "flex", mt: 2.5, px: 0, fontWeight: "bold" }}
      >
        Agregar alérgeno
      </Button>
      <div onChange={(e) => e.stopPropagation()}>
        <AllergenSelectionModal
          open={open}
          selected={value}
          onClose={() => setOpen(false)}
          onConfirm={(ids) => {
            onChange(ids);
            setOpen(false);
          }}
        />
      </div>
    </Box>
  );
};

export default AllergensSection;
