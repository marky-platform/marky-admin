import React from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import { FieldProps } from "formik";
import { ReactComponent as LocationIcon } from "../assets/icons/location-marker.svg";
import { ReactComponent as DinnerIcon } from "../assets/icons/cutlery.svg";

interface BusinessTypeOption {
  value: string;
  label: string;
  description: string;
}

interface BusinessTypeSelectorFieldProps extends FieldProps {
  label?: string;
  required?: boolean;
  options: BusinessTypeOption[];
  sx?: object;
}

const BusinessTypeSelectorField: React.FC<BusinessTypeSelectorFieldProps> = ({
  field,
  form,
  label,
  required = false,
  options,
  sx = {},
}) => {
  const selectedValue = field.value;

  const handleSelect = (value: string) => {
    form.setFieldValue(field.name, value);
  };

  return (
    <Box sx={sx}>
      {label && (
        <FormLabel>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </FormLabel>
      )}
      <Box display="flex" flexDirection={"column"} gap={2} mt={1}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <Card
              key={option.value}
              variant="outlined"
              onClick={() => handleSelect(option.value)}
              sx={{
                cursor: "pointer",
                border: isSelected ? "2px solid" : "1px solid",
                borderColor: isSelected ? "primary.main" : "grey.300",
                flex: 1,
                textAlign: "center",
                backgroundColor: "surface.main",
              }}
            >
              <CardActionArea sx={{ paddingY: 2 }}>
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      width: "66%",
                      textAlign: "left",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    {option.label === "Comercial" ? (
                      <LocationIcon />
                    ) : (
                      <DinnerIcon />
                    )}
                    {option.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "grey.900" }}
                    textAlign={"right"}
                  >
                    {option.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
      {form.touched[field.name] && form.errors[field.name] && (
        <FormHelperText error>
          {form.errors[field.name] as string}
        </FormHelperText>
      )}
    </Box>
  );
};

export default BusinessTypeSelectorField;
