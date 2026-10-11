import React from "react";
import {
  Box,
  Button,
  Chip,
  FormLabel,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FieldProps } from "formik";
import { ReactComponent as ParaguayFlagIcon } from "../assets/icons/flag-paraguay.svg";
import { ReactComponent as VenezuelaFlagIcon } from "../assets/icons/flag-venezuela.svg";

interface CustomSelectorFieldProps extends FieldProps {
  /** Etiqueta opcional para el campo */
  label?: string;
  /** Texto placeholder cuando no hay selección */
  placeholder?: string;
  /** Límite máximo de items seleccionados */
  maxSelected?: number;
  /** Función para disparar la apertura del modal */
  onOpen: () => void;
  /**
   * Función para extraer la etiqueta a mostrar de cada item.
   * Por defecto se asume que el objeto tiene la propiedad "label" o "name".
   */
  getOptionLabel?: (option: any) => string;
  required?: boolean;
  displayAsInput?: boolean;
  sx: object;
  /** Renderiza un ícono junto al texto de cada item seleccionado (chip) */
  renderIcon?: (option: any) => React.ReactNode;
}

const CustomSelectorField: React.FC<CustomSelectorFieldProps> = ({
  field,
  form,
  label,
  required = false,
  displayAsInput,
  sx,
  placeholder = "Seleccione opciones...",
  maxSelected = 10,
  onOpen,
  getOptionLabel = (option: any) => option.label || option.name || "Item",
  renderIcon,
}) => {
  // field.value es el valor almacenado en Formik, se espera que sea un array.
  const selectedItems = Array.isArray(field.value) ? field.value : [];

  // Función para eliminar un item de la selección.
  const handleDelete = (item: any, event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que se dispare el onClick del contenedor.
    const newItems = selectedItems.filter((i: any) => i.id !== item.id);
    form.setFieldValue(field.name, newItems);
  };

  if (displayAsInput) {
    return (
      <Box sx={sx}>
        {label && (
          <FormLabel>
            {label} {required && <span style={{ color: "red" }}>*</span>}
          </FormLabel>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder}
            sx={{
              backgroundColor: "grey.50",
            }}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  {selectedItems.length > 0 &&
                  getOptionLabel(selectedItems[0]) === "Paraguay" ? (
                    <ParaguayFlagIcon />
                  ) : (
                    <VenezuelaFlagIcon />
                  )}
                </InputAdornment>
              ),
              sx: {
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              },
            }}
            value={
              selectedItems.length > 0 ? getOptionLabel(selectedItems[0]) : ""
            }
          />
          <Button
            onClick={onOpen}
            variant="contained"
            color="inherit"
            sx={{
              color: "text.title",
              boxShadow: "unset",
            }}
          >
            Editar
          </Button>
        </Box>
        {form.touched[field.name] && form.errors[field.name] && (
          <Typography variant="caption" color="error">
            {form.errors[field.name] as string}
          </Typography>
        )}
      </Box>
    );
  }
  // DEFAULT DISPLAY
  return (
    <Box sx={sx}>
      {label && (
        <FormLabel>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </FormLabel>
      )}
      {/* Contenedor que se comporta como botón y abre el modal */}
      {(() => {
        // Los campos de selección única (país, ciudad, moneda) muestran el
        // chip plano una vez seleccionados, sin borde ni padding extra
        // alrededor — según Figma, solo el selector multi-selección
        // (categorías) conserva el recuadro azul persistente para poder
        // seguir agregando opciones.
        const isSingleSelectFilled = maxSelected === 1 && selectedItems.length > 0;
        return (
          <Box
            onClick={selectedItems.length < maxSelected ? onOpen : () => {}}
            sx={{
              border:
                selectedItems.length === 0
                  ? `2px dashed`
                  : isSingleSelectFilled
                  ? "none"
                  : `2px solid`,
              borderColor:
                selectedItems.length === 0
                  ? "primary.main"
                  : form.touched[field.name] && form.errors[field.name]
                  ? "error.main"
                  : "primary.main",
              borderRadius: 1.5,
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              cursor: "pointer",
              paddingX: selectedItems.length === 0 ? 4 : 0,
              paddingY:
                selectedItems.length === 0
                  ? 3.25
                  : isSingleSelectFilled
                  ? 0
                  : 1,
              marginTop: 2,
            }}
          >
            {selectedItems.length === 0 ? (
              <Typography variant="body2" color="primary">
                {placeholder}
              </Typography>
            ) : (
              selectedItems.map((item: any, index: number) => (
                <Chip
                  key={item.id || index}
                  color="primary"
                  variant="outlined"
                  label={
                    renderIcon ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {renderIcon(item)}
                        <span>{getOptionLabel(item)}</span>
                      </Box>
                    ) : (
                      getOptionLabel(item)
                    )
                  }
                  onDelete={(e) => handleDelete(item, e)}
                  deleteIcon={<CloseIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    margin: isSingleSelectFilled ? 0 : "4px",
                    width: "100%",
                    display: "flex",
                    paddingTop: 6,
                    paddingBottom: 6,
                    justifyContent: "space-between",
                    borderRadius: 2,
                    border: 0,
                    backgroundColor: "secondary.main",
                    color: "primary.main",
                    "& .MuiChip-label": { color: "primary.main" },
                    "& .MuiChip-deleteIcon": { color: "primary.main" },
                  }}
                />
              ))
            )}
            {selectedItems.length > 0 && selectedItems.length < maxSelected && (
              <Box sx={{ padding: 2 }}>
                <Typography variant="body1" fontWeight={"500"} color="primary">
                  Añadir otra opción
                </Typography>
              </Box>
            )}
          </Box>
        );
      })()}

      {/* Mensaje de error, si existe */}
      {form.touched[field.name] && form.errors[field.name] && (
        <Typography variant="caption" color="error">
          {form.errors[field.name] as string}
        </Typography>
      )}

      {/* Mensaje opcional cuando se alcanza el límite de selección */}
      {/* {maxSelected && selectedItems.length >= maxSelected && (
        <Typography variant="caption" color="warning.main">
          Se ha alcanzado el límite de selección.
        </Typography>
      )} */}
    </Box>
  );
};

export default CustomSelectorField;
