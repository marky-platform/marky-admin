import React from "react";
import { Formik, Form, FieldArray, getIn, useFormikContext } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Add from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import * as Yup from "yup";
import CancelButton from "../../../components/CancelButton";
import Input from "../../../components/Input";
import colors from "../../../themes/utils/colors";
import XButton from "../../../components/XButton";
import BackButton from "../../../components/BackButton";

const MAX_LOCATIONS = 4;
const NAME_MAX_LENGTH = 60;
const ADDRESS_MAX_LENGTH = 255;

export interface LocationEntryValue {
  id?: number;
  name: string;
  address: string;
}

interface LocationsFormValues {
  locations: LocationEntryValue[];
}

const validationSchema = Yup.object({
  locations: Yup.array()
    .of(
      Yup.object({
        name: Yup.string()
          .max(NAME_MAX_LENGTH, `El nombre no puede superar los ${NAME_MAX_LENGTH} caracteres`)
          .required("El nombre es obligatorio"),
        address: Yup.string()
          .max(ADDRESS_MAX_LENGTH, `La dirección no puede superar los ${ADDRESS_MAX_LENGTH} caracteres`)
          .required("La dirección es obligatoria"),
      }),
    )
    .max(MAX_LOCATIONS, `Puedes agregar como máximo ${MAX_LOCATIONS} ubicaciones`),
});

interface LocationEntryRowProps {
  index: number;
  onRemove: () => void;
}

const LocationEntryRow: React.FC<LocationEntryRowProps> = ({
  index,
  onRemove,
}) => {
  const { values, errors, touched, setFieldValue, handleBlur } =
    useFormikContext<LocationsFormValues>();
  const basePath = `locations[${index}]`;
  const entry = values.locations[index];

  const nameFieldName = `${basePath}.name`;
  const addressFieldName = `${basePath}.address`;

  const nameError = getIn(touched, nameFieldName)
    ? getIn(errors, nameFieldName)
    : undefined;
  const addressError = getIn(touched, addressFieldName)
    ? getIn(errors, addressFieldName)
    : undefined;

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: colors.light.grey[400],
        borderRadius: 1,
        p: 3,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "grey.50",
        position: "relative",
      }}
    >
      <Input
        label="Nombre"
        placeholder={`Ej. Casa Matriz`}
        name={nameFieldName}
        value={entry.name}
        onChange={(e) => setFieldValue(nameFieldName, e.target.value)}
        onBlur={handleBlur}
        maxLength={NAME_MAX_LENGTH}
        required
        error={!!nameError}
        helperText={nameError}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box flex={1} minWidth={0}>
          <Input
            label="Dirección"
            placeholder="Ej. Av. Mcal. López 1234"
            name={addressFieldName}
            value={entry.address}
            onChange={(e) => setFieldValue(addressFieldName, e.target.value)}
            onBlur={handleBlur}
            maxLength={ADDRESS_MAX_LENGTH}
            required
            error={!!addressError}
            helperText={addressError}
          />
        </Box>
        <Box display={"flex"} alignItems={"flex-end"}>
          <IconButton
            onClick={onRemove}
            aria-label={`Eliminar ubicación ${index + 1}`}
            sx={{
              backgroundColor: "grey.400",
              borderRadius: "6px",
              p: 2,
              flexShrink: 0,
              "&:hover": { backgroundColor: "grey.400" },
            }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

const LocationsModal = ({
  open,
  onBack,
  onClose,
  initialLocations,
  onSubmit,
}: {
  open: boolean;
  onBack?: () => void;
  onClose: () => void;
  initialLocations: LocationEntryValue[];
  onSubmit: (locations: LocationEntryValue[]) => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          borderBottom: "1px solid lightgrey",
        }}
      >
        <Box display={"flex"}>
          {onBack && (
            <Box display={"flex"} sx={{ paddingY: 3 }}>
              <BackButton onClick={onBack} sx={{ marginLeft: 2 }} />
            </Box>
          )}
          <DialogTitle>Ubicaciones</DialogTitle>
        </Box>
        <Box display={"flex"} sx={{ paddingY: 3 }}>
          <XButton
            onClick={onClose}
            sx={{
              marginRight: 2,
              ...(isMobile && {
                backgroundColor: colors.light.grey[400],
                borderRadius: "6px",
                "&:hover": { backgroundColor: colors.light.grey[400] },
              }),
            }}
          />
        </Box>
      </Box>

      <Formik<LocationsFormValues>
        initialValues={{
          locations: initialLocations.map(({ id, name, address }) => ({
            id,
            name,
            address,
          })),
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onSubmit(values.locations);
          onClose();
        }}
      >
        {({ values, errors, isValid, dirty }) => {
          const atLimit = values.locations.length >= MAX_LOCATIONS;
          const arrayError = getIn(errors, "locations");
          const arrayLevelError =
            typeof arrayError === "string" ? arrayError : undefined;

          return (
            <Form
              style={
                isMobile
                  ? {
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                    }
                  : undefined
              }
            >
              <DialogContent
                sx={
                  isMobile
                    ? { flex: 1, overflowY: "auto" }
                    : { maxHeight: "80vh" }
                }
              >
                <Typography
                  variant="body2"
                  sx={{ mb: 4, color: colors.light.grey[900] }}
                >
                  Añade tus direcciones más importantes: locales, sucursales o
                  zonas donde opera tu negocio.
                </Typography>

                <FieldArray name="locations">
                  {({ push, remove }) => (
                    <>
                      {values.locations.map((_, index) => (
                        <LocationEntryRow
                          key={index}
                          index={index}
                          onRemove={() => remove(index)}
                        />
                      ))}

                      {arrayLevelError && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ display: "block", mb: 2 }}
                        >
                          {arrayLevelError}
                        </Typography>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 2,
                          cursor: atLimit ? "default" : "pointer",
                        }}
                        onClick={() => {
                          if (atLimit) return;
                          push({ name: "", address: "" });
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
                        <Button disabled={atLimit}>Añadir otra ubicación</Button>
                      </Box>
                      {atLimit && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Has alcanzado el máximo de {MAX_LOCATIONS} ubicaciones
                        </Typography>
                      )}
                    </>
                  )}
                </FieldArray>
              </DialogContent>
              <DialogActions
                sx={{
                  borderTop: "1px solid lightgrey",
                  display: "flex",
                  gap: 2,
                  padding: 4,
                  flexShrink: 0,
                  ...(isMobile && { "& > button": { flex: 1 } }),
                }}
              >
                <CancelButton sx={{ paddingX: 4 }} onClick={onClose}>
                  Cancelar
                </CancelButton>
                <Button
                  disabled={!isValid || !dirty}
                  sx={{ paddingX: 4 }}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Guardar
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default LocationsModal;
