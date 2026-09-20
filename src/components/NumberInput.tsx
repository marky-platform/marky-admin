import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  TextField,
  Typography,
  TextFieldProps,
} from "@mui/material";
import { FieldProps, getIn } from "formik";

const NumberInput: React.FC<
  FieldProps & {
    label: string;
    required?: boolean;
    helperText?: string;
    disabled?: boolean;
    placeholder?: string;
    description?: string;
    InputProps?: TextFieldProps["InputProps"];
    sx?: object;
  }
> = ({
  field,
  form,
  label,
  description,
  required = false,
  helperText,
  disabled = false,
  placeholder,
  InputProps,
  sx,
}) => {
  // Estado local para el valor mostrado en el input (formateado en estilo LATAM)
  const [displayValue, setDisplayValue] = useState<string>("");

  // Función para formatear el valor "raw" (ej: "1234.56") al formato LATAM ("1.234,56")
  const formatToDisplay = (raw: string): string => {
    if (!raw) return "";
    const [intPart, decPart] = raw.split(".");
    // Agrega separadores de miles (puntos)
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decPart ? `${formattedInt},${decPart}` : formattedInt;
  };

  // Función para convertir el valor en formato LATAM al formato "raw" (backend)
  const formatToRaw = (display: string): string => {
    // Remueve puntos (separador de miles) y reemplaza la coma decimal por un punto
    return display.replace(/\./g, "").replace(",", ".");
  };

  // Inicializa/sincroniza el displayValue a partir del valor almacenado en
  // Formik. IMPORTANTE: no debemos pisar lo que el usuario está escribiendo.
  // Cada `handleChange` llama a `form.setFieldValue`, lo que dispara este
  // efecto de nuevo con el `field.value` recién actualizado. Si simplemente
  // reformateáramos siempre, un valor intermedio como "15," (el usuario
  // acaba de escribir la coma decimal, todavía no el dígito decimal) se
  // reformatea a "15" porque `formatToDisplay` descarta una parte decimal
  // vacía — borrando la coma antes de que el usuario pueda escribir el
  // decimal. Por eso solo resincronizamos cuando el valor entrante
  // realmente representa un número distinto al que el usuario ya tiene
  // escrito en pantalla (cambios externos: carga inicial, edición de
  // producto, reset del formulario, etc.).
  useEffect(() => {
    setDisplayValue((prevDisplay) => {
      const prevRaw = formatToRaw(prevDisplay);
      const incoming = field.value ? String(field.value) : "";
      const sameRaw = prevRaw === incoming;
      const sameNumericValue =
        prevRaw !== "" &&
        incoming !== "" &&
        !isNaN(Number(prevRaw)) &&
        !isNaN(Number(incoming)) &&
        Number(prevRaw) === Number(incoming);
      if (sameRaw || sameNumericValue) {
        return prevDisplay;
      }
      return incoming ? formatToDisplay(incoming) : "";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newDisplay = e.target.value;
    // Permitir solo dígitos, puntos y comas (sin signo negativo)
    newDisplay = newDisplay.replace(/[^0-9.,]/g, "");

    // El usuario puede escribir el separador decimal con coma o con punto
    // (ver ticket "Unificar formato decimal en campos de precio"). Se toma
    // el ÚLTIMO separador ingresado como decimal; cualquier separador
    // anterior se descarta. Antes, un "." se trataba siempre como
    // separador de miles y se eliminaba al guardar, así que escribir
    // "0.8" terminaba guardándose como "08" (8) en vez de 0.8.
    const lastSeparatorIndex = Math.max(
      newDisplay.lastIndexOf(","),
      newDisplay.lastIndexOf("."),
    );

    if (lastSeparatorIndex === -1) {
      newDisplay = newDisplay.replace(/[.,]/g, "");
    } else {
      const intPart = newDisplay.slice(0, lastSeparatorIndex).replace(/[.,]/g, "");
      // Limitar a 2 decimales tras el separador (backend: DecimalField decimal_places=2)
      const decPart = newDisplay
        .slice(lastSeparatorIndex + 1)
        .replace(/[.,]/g, "")
        .slice(0, 2);
      newDisplay = `${intPart},${decPart}`;
    }

    setDisplayValue(newDisplay);
    const newRaw = formatToRaw(newDisplay);
    form.setFieldValue(field.name, newRaw);
  };

  const handleBlur = () => {
    form.setFieldTouched(field.name, true);
    // Normaliza el valor visible a 2 decimales al perder foco, p. ej.
    // "0,4" -> "0,40", "1" -> "1,00", "0.8" -> "0,80".
    if (!displayValue) return;
    const numeric = Number(formatToRaw(displayValue));
    if (Number.isNaN(numeric)) return;
    const paddedRaw = numeric.toFixed(2);
    setDisplayValue(formatToDisplay(paddedRaw));
    form.setFieldValue(field.name, paddedRaw);
  };

  // field.name can be a nested path (e.g. "variants[0].price"); touched/errors
  // are nested objects/arrays, so a literal form.touched[field.name] lookup
  // always misses for anything but a top-level field name. getIn resolves
  // the path correctly in both cases.
  const isTouched = getIn(form.touched, field.name);
  const fieldError = getIn(form.errors, field.name);

  return (
    <FormControl
      fullWidth
      error={Boolean(isTouched && fieldError)}
      disabled={disabled}
      sx={sx}
      data-testid="number-input-form-control"
    >
      <FormLabel>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </FormLabel>

      {description && (
        <Typography
          id="modal-description"
          variant="body2"
          sx={{ mt: 2, mb: 1 }}
        >
          {description}
        </Typography>
      )}

      <TextField
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        placeholder={placeholder}
        InputProps={{
          ...InputProps,
        }}
        error={Boolean(isTouched && fieldError)}
        helperText={
          isTouched && fieldError ? String(fieldError) : helperText
        }
      />
    </FormControl>
  );
};

export default NumberInput;
