import { Box, Typography } from "@mui/material";
import glutenFreeIcon from "../../../assets/icons/product-form/gluten-free.svg";
import glutenFreeBadge from "../../../assets/icons/product-form/gluten-free-badge.svg";
import CheckboxWithLabel from "../../../components/CheckboxWithLabel";
import CustomSwitch from "../../../components/CustomSwitch";
import { CeliacFormState } from "../../../types/product";
import { defaultCeliacForm } from "../../../utils/productExtras";

interface CeliacSectionProps {
  value: CeliacFormState;
  onChange: (next: CeliacFormState) => void;
}

const DECLARATIONS: {
  key: Exclude<keyof CeliacFormState, "enabled">;
  label: string;
}[] = [
  {
    key: "crossContaminationControl",
    label: "Control de contaminación cruzada",
  },
  { key: "glutenFreeGrains", label: "Sin trigo, avena, cebada ni centeno" },
  { key: "certifiedProtocol", label: "Protocolo declarado o certificación" },
];

const CeliacSection = ({ value, onChange }: CeliacSectionProps) => (
  <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 5, mb: 3 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Box
        component="img"
        src={glutenFreeIcon}
        alt=""
        sx={{ width: 24, height: 24 }}
      />
      <Typography variant="h6" fontWeight="bold">
        Control para Celíacos (SIN TACC)
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 2.5 }}>
      <CustomSwitch
        checked={value.enabled}
        // Apagar el switch limpia las tres declaraciones de inmediato;
        // encenderlo no selecciona ninguna.
        onChange={(e) =>
          onChange(
            e.target.checked
              ? { ...defaultCeliacForm(), enabled: true }
              : defaultCeliacForm(),
          )
        }
        inputProps={{ "aria-label": "Control para Celíacos (SIN TACC)" }}
        sx={{ flexShrink: 0 }}
      />
      <Typography variant="body2">
        Activa este filtro si tu producto está dirigido para personas con
        celiaquía.
      </Typography>
    </Box>
    {value.enabled && (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            mt: 2.5,
            px: 4,
            py: 3,
            bgcolor: "grey.50",
            borderRadius: 4,
          }}
        >
          <Box
            component="img"
            src={glutenFreeBadge}
            alt=""
            sx={{ width: 40, height: 40, flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.primary">
              Apto para celíacos (SIN TACC)
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                mt: 2.5,
              }}
            >
              {DECLARATIONS.map(({ key, label }) => (
                <CheckboxWithLabel
                  key={key}
                  label={label}
                  checked={value[key]}
                  onChange={(e) =>
                    onChange({ ...value, [key]: e.target.checked })
                  }
                />
              ))}
            </Box>
          </Box>
        </Box>
        {/* text.disabled (#6B7280) cumple AA (4.8:1) sobre blanco */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ display: "block", mt: 2.5 }}
        >
          *El nivel de certificación se detalla en el detalle del producto, sus
          clientes podrán verlo.
        </Typography>
      </>
    )}
  </Box>
);

export default CeliacSection;
