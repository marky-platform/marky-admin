// Input.tsx
import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface InputProps {
  label: string;
  type?: string;
  required?: boolean;
  // explicit error flag (overrides formik error if provided)
  error?: boolean;
  maxLength?: number;
  // "remaining" (default) shows characters left; "fraction" shows current/max
  counterFormat?: "remaining" | "fraction";
  // "adornment" (default, current behavior) renders the counter inside the
  // input; "label" renders it aligned right in the FormLabel row, as in Figma
  counterPosition?: "adornment" | "label";
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  name?: string;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // opcional
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // opcional
  sx?: object;
  InputProps?: object; // New prop for TextField's InputProps
  // Formik field props (optional) - when Field passes component={Input}
  field?: any;
  form?: any;
  meta?: any;
  /** Ícono/elemento extra a mostrar al final del input (ej. check de disponibilidad) */
  endAdornment?: React.ReactNode;
  /** Sobrescribe el color del helper text (ej. azul para "Nombre disponible") */
  helperTextColor?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  required = false,
  error: errorProp = false,
  helperText: helperTextProp,
  maxLength,
  counterFormat = "remaining",
  counterPosition = "adornment",
  disabled = false,
  placeholder,
  value: valueProp,
  name: nameProp,
  multiline,
  rows,
  maxRows,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  sx,
  InputProps: customInputProps, // Destructure InputProps
  field,
  form,
  meta,
  endAdornment,
  helperTextColor,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Determine current value and handlers: prefer Formik's field if provided
  const currentValue =
    field && field.value !== undefined ? field.value : valueProp;
  const currentOnChange =
    field && field.onChange ? field.onChange : onChangeProp;
  const currentOnBlur = field && field.onBlur ? field.onBlur : onBlurProp;
  const inputName = (field && field.name) || nameProp;

  const touched = form && inputName ? form.touched?.[inputName] : undefined;
  const fieldError = form && inputName ? form.errors?.[inputName] : undefined;

  const error = errorProp ?? (touched && Boolean(fieldError));
  const helperText =
    helperTextProp ?? (touched && fieldError ? String(fieldError) : undefined);

  const hasEndAdornment =
    type === "password" ||
    (maxLength !== undefined && counterPosition === "adornment") ||
    Boolean(endAdornment);

  const endAdornmentElements = (
    <>
      {type === "password" && (
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      )}
      {maxLength !== undefined && counterPosition === "adornment" && (
        <InputAdornment position="end">
          <Typography variant="caption" color="textSecondary">
            {counterFormat === "fraction"
              ? `${currentValue?.length || 0}/${maxLength}`
              : maxLength - (currentValue?.length || 0)}
          </Typography>
        </InputAdornment>
      )}
      {endAdornment && (
        <InputAdornment position="end" sx={{ pl: 1 }}>
          {endAdornment}
        </InputAdornment>
      )}
    </>
  );

  return (
    <FormControl fullWidth error={error} disabled={disabled} sx={sx}>
      <Box
        sx={
          maxLength !== undefined && counterPosition === "label"
            ? { display: "flex", justifyContent: "space-between", alignItems: "baseline" }
            : undefined
        }
      >
        <FormLabel>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </FormLabel>
        {maxLength !== undefined && counterPosition === "label" && (
          <Typography variant="caption" color="textSecondary">
            {counterFormat === "fraction"
              ? `${currentValue?.length || 0}/${maxLength}`
              : maxLength - (currentValue?.length || 0)}
          </Typography>
        )}
      </Box>
      <TextField
        name={inputName}
        value={currentValue}
        onChange={currentOnChange}
        onBlur={currentOnBlur}
        type={showPassword ? "text" : type}
        variant="outlined"
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        fullWidth
        multiline={multiline}
        rows={rows}
        maxRows={maxRows}
        sx={(theme) => ({
          mt: 0.5,
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.grey[100],
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.grey[800],
          },
          "& .MuiInputBase-input::placeholder": {
            color: theme.palette.text.disabled,
            opacity: 1,
          },
        })}
        InputProps={{
          endAdornment: hasEndAdornment ? endAdornmentElements : undefined,
          ...customInputProps, // Spread customInputProps here
        }}
        inputProps={{
          ...(maxLength ? { maxLength } : {}),
        }}
      />
      {helperText && (
        <FormHelperText sx={helperTextColor ? { color: helperTextColor } : undefined}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default Input;
