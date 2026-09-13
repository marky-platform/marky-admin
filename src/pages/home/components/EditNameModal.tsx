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
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as Yup from "yup";
import CancelButton from "../../../components/CancelButton";
import colors from "../../../themes/utils/colors";
import XButton from "../../../components/XButton";
import BackButton from "../../../components/BackButton";

const MAX_NAME_LENGTH = 50;

const EditNameModal = ({
  open,
  onBack,
  onClose,
  initialName,
  onSubmit,
}: {
  open: boolean;
  onBack?: () => void;
  onClose: () => void;
  initialName: string;
  onSubmit: (name: string) => void;
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
          <DialogTitle>Nombre del comercio</DialogTitle>
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
        initialValues={{ business_name: initialName || "" }}
        validationSchema={Yup.object({
          business_name: Yup.string()
            .max(
              MAX_NAME_LENGTH,
              `El nombre no puede superar los ${MAX_NAME_LENGTH} caracteres`,
            )
            .required("El nombre es obligatorio"),
        })}
        onSubmit={(values) => {
          onSubmit(values.business_name);
          onClose();
        }}
      >
        {({
          values,
          handleChange,
          errors,
          touched,
          isValid,
          dirty,
        }) => (
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
              <FormLabel>Nombre</FormLabel>
              <TextField
                sx={{ mt: 2 }}
                name="business_name"
                placeholder="Ej. Dulce Momento"
                variant="outlined"
                fullWidth
                value={values.business_name}
                onChange={handleChange}
                error={touched.business_name && Boolean(errors.business_name)}
                helperText={touched.business_name && errors.business_name}
                inputProps={{ maxLength: MAX_NAME_LENGTH }}
              />
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
        )}
      </Formik>
    </Dialog>
  );
};

export default EditNameModal;
