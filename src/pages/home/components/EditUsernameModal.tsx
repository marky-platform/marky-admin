import React from "react";
import { Formik, Form } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormLabel,
  Typography,
  CircularProgress,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as Yup from "yup";
import CancelButton from "../../../components/CancelButton";
import colors from "../../../themes/utils/colors";
import XButton from "../../../components/XButton";
import BackButton from "../../../components/BackButton";
import {
  sanitizeBusinessId,
  sanitizeBusinessIdLive,
} from "../../../utils/sanitizeBusinessId";
import { validateBusinessNameDebounced } from "../../../services/businessService";

const MIN_BUSINESS_ID_LENGTH = 4;
const MAX_BUSINESS_ID_LENGTH = 24;

const EditUsernameModal = ({
  open,
  onBack,
  onClose,
  initialUsername,
  onSubmit,
}: {
  open: boolean;
  onBack?: () => void;
  onClose: () => void;
  initialUsername: string;
  onSubmit: (businessId: string) => void;
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
          <DialogTitle>Usuario</DialogTitle>
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

      <Formik
        initialValues={{ business_id: initialUsername || "" }}
        validationSchema={Yup.object({
          business_id: Yup.string()
            .required("Este campo es obligatorio")
            .matches(
              /^[a-z0-9\-_]+$/,
              "Solo se permiten letras minúsculas, guiones (-) y guiones bajos (_)",
            )
            .min(
              MIN_BUSINESS_ID_LENGTH,
              `No puede tener menos de ${MIN_BUSINESS_ID_LENGTH} caracteres`,
            )
            .max(
              MAX_BUSINESS_ID_LENGTH,
              `No puede tener más de ${MAX_BUSINESS_ID_LENGTH} caracteres`,
            )
            .test(
              "unique-business-id",
              "Este nombre de usuario ya existe",
              async function (value?: string) {
                if (!value || value.length < MIN_BUSINESS_ID_LENGTH) return true;
                // Reabrir sin cambios no debe marcar el usuario actual como
                // "tomado": el backend valida por iexact sin excluirse a sí mismo.
                if (
                  initialUsername &&
                  value.toLowerCase() === initialUsername.toLowerCase()
                ) {
                  return true;
                }
                try {
                  const result = await validateBusinessNameDebounced(value);
                  return !result.is_taken;
                } catch (error) {
                  //@ts-ignore
                  return this.createError({
                    message: "Error al validar el nombre de usuario",
                  });
                }
              },
            ),
        })}
        onSubmit={(values) => {
          onSubmit(sanitizeBusinessId(values.business_id));
          onClose();
        }}
      >
        {({
          values,
          setFieldValue,
          handleBlur,
          errors,
          touched,
          isValid,
          isValidating,
          dirty,
        }) => {
          const meetsMinLength =
            values.business_id.length >= MIN_BUSINESS_ID_LENGTH;
          const isChecking = meetsMinLength && isValidating;
          const isAvailable =
            meetsMinLength && !errors.business_id && !isValidating;

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
                <FormLabel>Usuario</FormLabel>
                <TextField
                  sx={{ mt: 2 }}
                  name="business_id"
                  placeholder="Ej. dulcemomento"
                  variant="outlined"
                  fullWidth
                  value={values.business_id}
                  onChange={(e) =>
                    setFieldValue(
                      "business_id",
                      sanitizeBusinessIdLive(e.target.value),
                    )
                  }
                  onBlur={(e) => {
                    setFieldValue(
                      "business_id",
                      sanitizeBusinessId(e.target.value),
                    );
                    handleBlur(e);
                  }}
                  error={touched.business_id && Boolean(errors.business_id)}
                  helperText={
                    isAvailable
                      ? "Nombre de usuario disponible"
                      : touched.business_id
                        ? errors.business_id
                        : undefined
                  }
                  FormHelperTextProps={{
                    sx: isAvailable ? { color: "primary.main" } : undefined,
                  }}
                  inputProps={{ maxLength: MAX_BUSINESS_ID_LENGTH }}
                  InputProps={{
                    endAdornment: isChecking ? (
                      <CircularProgress size={18} />
                    ) : undefined,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ mt: 4, color: colors.light.grey[900] }}
                >
                  Tu enlace público: marky.one/{values.business_id || "..."}
                </Typography>
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
                  disabled={!isValid || !dirty || isValidating}
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

export default EditUsernameModal;
