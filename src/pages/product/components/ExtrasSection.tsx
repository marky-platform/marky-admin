import React from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { Field, FieldArray, FormikProps, getIn } from "formik";
import NumberInput from "../../../components/NumberInput";
import Input from "../../../components/Input";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useBusinessAccountInfo } from "../../../hooks/useBusinessAccountInfo";

interface ExtrasSectionProps extends FormikProps<any> {
  maxItems?: number;
  // Lifted up to ProductFormPage so the "Activar productos adicionales"
  // selection survives switching to another tab and back (switching tabs
  // unmounts this component, which would otherwise reset any local state
  // back to its default).
  showExtras: boolean;
  onShowExtrasChange: (value: boolean) => void;
}

const ExtrasSection: React.FC<ExtrasSectionProps> = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  maxItems = 10,
  showExtras,
  onShowExtrasChange,
}) => {
  const { data: businessAccountInfo } = useBusinessAccountInfo();
  const currencyCode = businessAccountInfo?.primary_currency_code;

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.100",
        borderRadius: 2,
        p: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <LocalOfferIcon />
        <Typography variant="h6" fontWeight="bold">
          Adicionales o extras
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={showExtras}
            onChange={(e) => onShowExtrasChange(e.target.checked)}
          />
        }
        label="Activar productos adicionales"
      />
      {showExtras && (
        <FieldArray name="addons">
          {({ push, remove }) => {
            const visibleAddons = values.addons
              .map((addon: any, index: number) => ({ addon, index }))
              .filter(({ addon }: any) => !addon._delete);
            return (
            <Box mt={2}>
              {visibleAddons.map(({ addon, index }: any) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid",
                    borderColor: "grey.100",
                    borderRadius: 1,
                    p: 3,
                    mb: 2,
                    display: "flex",
                    // Mobile: nombre y precio en filas separadas, con el
                    // eliminar arriba a la derecha (sin superponerse).
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "center" },
                    gap: 3,
                    backgroundColor: "grey.50",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "stretch", md: "center" },
                      flex: 1,
                      gap: 2,
                    }}
                  >
                    <Input
                      name={`addons[${index}].name`}
                      label="Nombre de adicional o extra"
                      placeholder="Nombre de adicional o extra"
                      value={addon.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      error={
                        getIn(touched, `addons[${index}].name`) &&
                        Boolean(getIn(errors, `addons[${index}].name`))
                      }
                      helperText={
                        getIn(touched, `addons[${index}].name`)
                          ? getIn(errors, `addons[${index}].name`)
                          : undefined
                      }
                      InputProps={{
                        sx: {
                          backgroundColor: "white",
                        },
                      }}
                    />
                    <Field
                      name={`addons[${index}].price`}
                      component={NumberInput}
                      label="Precio"
                      required
                      fullWidth
                      margin="normal"
                      sx={{ width: { xs: "60%", md: "100%" }, minWidth: { xs: 160, md: 0 } }}
                      InputProps={{
                        sx: {
                          backgroundColor: "white",
                        },
                        endAdornment: currencyCode ? (
                          <InputAdornment position="end">
                            <Typography variant="body2">{`[${currencyCode}]`}</Typography>
                          </InputAdornment>
                        ) : undefined,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      order: { xs: -1, md: 0 },
                      alignSelf: { xs: "flex-end", md: "auto" },
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        // Persisted rows (real DB id) are soft-deleted so the
                        // submit handler can send a { id, _delete: true }
                        // tombstone the backend understands. Rows that were
                        // never saved (no id yet) can just be spliced out.
                        if (addon.id) {
                          setFieldValue(`addons[${index}]._delete`, true);
                        } else {
                          remove(index);
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 4,
                  cursor:
                    visibleAddons.length >= maxItems ? "default" : "pointer",
                }}
                onClick={() => {
                  if (visibleAddons.length >= maxItems) return;
                  push({ name: "", price: "" });
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: "#DBE9F9",
                    borderRadius: 2,
                    mr: 2,
                  }}
                >
                  <Add fontSize="large" color="primary" sx={{ mt: 1 }} />
                </Box>
                <Button disabled={visibleAddons.length >= maxItems}>
                  Añadir otro extra
                </Button>
              </Box>
            </Box>
            );
          }}
        </FieldArray>
      )}
    </Box>
  );
};

export default ExtrasSection;
