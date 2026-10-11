import { ArrowDropDown } from "@mui/icons-material";
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  TextField,
} from "@mui/material";
import React from "react";

interface SelectButtonFieldProps {
  label?: string;
  placeholder?: string;
  displayText?: string;
  required?: boolean;
  onClick: () => void;
  sx?: object;
  error?: boolean;
  helperText?: string;
}

const SelectButtonField: React.FC<SelectButtonFieldProps> = ({
  label,
  displayText,
  placeholder = "Seleccione una opción",
  required = false,
  onClick,
  sx = {},
  error,
  helperText,
}) => {
  return (
    <FormControl fullWidth error={error}>
      {label && (
        <FormLabel>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </FormLabel>
      )}
      {/* By placing the onClick on a wrapping Box, we can capture clicks
          even though the TextField itself is disabled. */}
      <Box onClick={onClick} sx={{ cursor: "pointer", ...sx }}>
        <TextField
          variant="outlined"
          fullWidth
          // The disabled prop gives it the correct greyed-out styling
          disabled
          value={displayText || placeholder}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <ArrowDropDown />
              </InputAdornment>
            ),
          }}
          // Ensure the text color is not the disabled grey
          sx={{
            pointerEvents: "none",
            "& .MuiInputBase-input.Mui-disabled": {
              WebkitTextFillColor: (theme) =>
                displayText ? theme.palette.text.black : theme.palette.text.grey,
              color: displayText ? "text.black" : "text.grey",
            },
          }}
        />
      </Box>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectButtonField;
