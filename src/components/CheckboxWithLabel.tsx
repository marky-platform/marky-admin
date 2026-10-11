// src/components/CheckboxWithLabel.tsx

import React from "react";
import { FormControlLabel, Checkbox, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

interface CheckboxWithLabelProps {
  label: string | React.ReactNode;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UncheckedIcon = styled("span")(({ theme }) => ({
  display: "inline-block",
  width: 22,
  height: 22,
  borderRadius: 4,
  border: `1px solid ${theme.palette.grey[800]}`,
  boxSizing: "border-box",
}));

const CheckedIcon = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 22,
  height: 22,
  borderRadius: 4,
  boxSizing: "border-box",
  backgroundColor: theme.palette.primary.main,
  "&::after": {
    content: '""',
    width: 12,
    height: 6,
    borderLeft: `2px solid ${theme.palette.fixed.white}`,
    borderBottom: `2px solid ${theme.palette.fixed.white}`,
    transform: "rotate(-45deg) translate(1px, -1px)",
  },
}));

const CheckboxWithLabel: React.FC<CheckboxWithLabelProps> = ({
  label,
  name,
  checked,
  disabled,
  onChange,
}) => {
  const theme = useTheme();
  return (
    <FormControlLabel
      disabled={disabled}
      sx={{
        marginLeft: 0,
        gap: theme.spacing(2), // 8px
      }}
      control={
        <Checkbox
          size="medium"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          disableRipple
          sx={{ padding: 0 }}
          icon={<UncheckedIcon data-testid="checkbox-icon-unchecked" />}
          checkedIcon={<CheckedIcon data-testid="checkbox-icon-checked" />}
        />
      }
      label={<Typography variant="body2">{label}</Typography>}
    />
  );
};

export default CheckboxWithLabel;
