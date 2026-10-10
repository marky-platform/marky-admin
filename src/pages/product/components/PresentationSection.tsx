import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Box,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { FormikProps, getIn } from "formik";
import React from "react";
import CustomSwitch from "../../../components/CustomSwitch";
import {
  AmountType,
  DimensionShape,
  PresentationFormState,
  Product,
} from "../../../types/product";
import {
  defaultPresentationForm,
  MAX_PEOPLE,
  UNITS_BY_AMOUNT_TYPE,
} from "../../../utils/productExtras";

const FIELD = "presentationForm";

// Los inputs dentro de los contenedores grises van con fondo blanco (Figma).
const inputOnGrey = {
  "& .MuiOutlinedInput-root": { bgcolor: "background.default" },
};

const UNIT_LABELS = { g: "g", kg: "kg", ml: "ml", l: "L" } as const;

// Cada módulo vive en su propio contenedor gris claro: contenido a la izquierda,
// switch a la derecha centrado verticalmente (Figma 6689-15640).
const ModuleContainer = ({
  title,
  checked,
  onChange,
  children,
}: {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 3,
      bgcolor: "grey.50",
      borderRadius: 4,
      px: 3,
      py: 2,
    }}
  >
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="body2" fontWeight="bold" color="text.secondary">
        {title}
      </Typography>
      {children}
    </Box>
    <CustomSwitch
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      inputProps={{ "aria-label": title }}
      sx={{ flexShrink: 0 }}
    />
  </Box>
);

const PresentationSection = ({ formik }: { formik: FormikProps<Product> }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched } = formik;
  const form: PresentationFormState =
    values.presentationForm ?? defaultPresentationForm();
  const defaults = defaultPresentationForm();

  const set = (patch: Partial<PresentationFormState>) =>
    setFieldValue(FIELD, { ...form, ...patch });

  const numberField = (
    key: keyof PresentationFormState,
    label: string,
    opts: {
      integer?: boolean;
      suffix?: string;
      sx?: Record<string, unknown>;
    } = {},
  ) => {
    const path = `${FIELD}.${key}`;
    const error = getIn(touched, path) && getIn(errors, path);
    return (
      <TextField
        label={label}
        value={form[key] as string}
        onChange={(e) =>
          set({ [key]: e.target.value } as Partial<PresentationFormState>)
        }
        onBlur={() => setFieldTouched(path, true)}
        error={Boolean(error)}
        helperText={error || undefined}
        inputProps={{ inputMode: opts.integer ? "numeric" : "decimal" }}
        InputProps={{
          endAdornment: opts.suffix ? (
            <Typography variant="body2" color="text.secondary">
              {opts.suffix}
            </Typography>
          ) : undefined,
        }}
        sx={{ maxWidth: { xs: "100%", md: 238 }, ...inputOnGrey, ...opts.sx }}
      />
    );
  };

  return (
    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 5, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Presentación
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Opcional
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
        {/* Cantidad */}
        <ModuleContainer
          title="¿Cómo se mide este producto?"
          checked={form.amountEnabled}
          onChange={(checked) =>
            set(
              checked
                ? { amountEnabled: true }
                : {
                    amountEnabled: false,
                    amountType: defaults.amountType,
                    amountValue: "",
                    amountUnit: defaults.amountUnit,
                  },
            )
          }
        >
          {form.amountEnabled && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
            >
              <RadioGroup
                row
                aria-label="Tipo de cantidad"
                value={form.amountType}
                onChange={(e) => {
                  const amountType = e.target.value as AmountType;
                  // Al cambiar de tipo no se arrastran valor ni unidad anteriores.
                  set({
                    amountType,
                    amountValue: "",
                    amountUnit:
                      amountType === "units"
                        ? defaults.amountUnit
                        : UNITS_BY_AMOUNT_TYPE[amountType][0],
                  });
                }}
              >
                <FormControlLabel
                  value="units"
                  control={<Radio />}
                  label="Unidades"
                />
                <FormControlLabel
                  value="weight"
                  control={<Radio />}
                  label="Peso"
                />
                <FormControlLabel
                  value="volume"
                  control={<Radio />}
                  label="Volumen"
                />
              </RadioGroup>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                {numberField(
                  "amountValue",
                  form.amountType === "units"
                    ? "Cantidad de unidades"
                    : "Cantidad",
                  { integer: form.amountType === "units" },
                )}
                {form.amountType !== "units" && (
                  <TextField
                    select
                    label="Unidad"
                    value={form.amountUnit}
                    onChange={(e) =>
                      set({
                        amountUnit: e.target
                          .value as PresentationFormState["amountUnit"],
                      })
                    }
                    sx={{ minWidth: 100, ...inputOnGrey }}
                  >
                    {UNITS_BY_AMOUNT_TYPE[form.amountType].map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Box>
            </Box>
          )}
        </ModuleContainer>

        {/* Tamaño */}
        <ModuleContainer
          title="Tamaño"
          checked={form.dimensionsEnabled}
          onChange={(checked) =>
            set(
              checked
                ? { dimensionsEnabled: true }
                : {
                    dimensionsEnabled: false,
                    shape: defaults.shape,
                    diameterCm: "",
                    lengthCm: "",
                    widthCm: "",
                    heightCm: "",
                  },
            )
          }
        >
          {form.dimensionsEnabled && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
            >
              <RadioGroup
                row
                aria-label="Forma"
                value={form.shape}
                onChange={(e) => {
                  const shape = e.target.value as DimensionShape;
                  // Se limpian los campos exclusivos de la forma anterior.
                  set(
                    shape === "round"
                      ? { shape, lengthCm: "", widthCm: "" }
                      : { shape, diameterCm: "" },
                  );
                }}
              >
                <FormControlLabel
                  value="round"
                  control={<Radio />}
                  label="Redondo"
                />
                <FormControlLabel
                  value="rectangular"
                  control={<Radio />}
                  label="Rectangular"
                />
              </RadioGroup>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {form.shape === "round" ? (
                  numberField("diameterCm", "Diámetro", { suffix: "cm" })
                ) : (
                  <>
                    {numberField("lengthCm", "Largo", { suffix: "cm" })}
                    {numberField("widthCm", "Ancho", { suffix: "cm" })}
                  </>
                )}
                {numberField("heightCm", "Alto (opcional)", { suffix: "cm" })}
              </Box>
            </Box>
          )}
        </ModuleContainer>

        {/* Rendimiento */}
        <ModuleContainer
          title="Rendimiento aproximado"
          checked={form.yieldEnabled}
          onChange={(checked) =>
            set(
              checked
                ? { yieldEnabled: true, minPeople: form.minPeople || "1" }
                : { yieldEnabled: false, minPeople: "", maxPeople: "" },
            )
          }
        >
          {form.yieldEnabled && (
            // Figma (6689-15640) solo muestra un valor exacto con stepper: no hay
            // rango, así que `maxPeople` queda sin usar (null al enviar).
            <Box
              data-testid="yield-row"
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                // Sin wrap: en mobile "persona/personas" debe quedar en la
                // misma línea que el stepper (el campo se encoge si hace falta).
                flexWrap: "nowrap",
                mt: 1,
              }}
            >
              <IconButton
                aria-label="Menos personas"
                disabled={(Number(form.minPeople) || 0) <= 1}
                onClick={() =>
                  set({
                    minPeople: String(
                      Math.max(1, (Number(form.minPeople) || 1) - 1),
                    ),
                  })
                }
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
              {numberField("minPeople", "Personas", {
                integer: true,
                sx: {
                  flex: { xs: "1 1 0", md: "0 1 auto" },
                  minWidth: { xs: 64, md: 0 },
                  maxWidth: { xs: 96, md: 238 },
                },
              })}
              <IconButton
                color="primary"
                aria-label="Más personas"
                disabled={(Number(form.minPeople) || 0) >= MAX_PEOPLE}
                onClick={() =>
                  set({
                    minPeople: String(
                      Math.min(MAX_PEOPLE, (Number(form.minPeople) || 0) + 1),
                    ),
                  })
                }
              >
                <AddCircleOutlineIcon />
              </IconButton>
              <Typography variant="body2" sx={{ flexShrink: 0 }}>
                {Number(form.minPeople) === 1 ? "persona" : "personas"}
              </Typography>
            </Box>
          )}
        </ModuleContainer>
      </Box>
    </Box>
  );
};

export default PresentationSection;
