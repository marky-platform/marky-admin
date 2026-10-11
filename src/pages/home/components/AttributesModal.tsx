import React from "react";
import { Formik, Form } from "formik";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as Yup from "yup";
import CancelButton from "../../../components/CancelButton";
import { Attribute } from "..";
import XButton from "../../../components/XButton";
import InsetSurface from "../../../themes/InsetSurface";
import BackButton from "../../../components/BackButton";
import { useAttributes } from "../../../hooks/useAttributes";

interface AttributesModalProps {
  open: boolean;
  onBack?: () => void;
  onClose: () => void;
  initialAttributes: Attribute[];
  onSubmit: (attributes: Attribute[]) => void;
}

const AttributesModal: React.FC<AttributesModalProps> = ({
  open,
  onBack,
  onClose,
  initialAttributes,
  onSubmit,
}) => {
  const { data: attributesData } = useAttributes(open);
  const attributes = attributesData?.results || [];
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
      <InsetSurface>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          borderBottom: (theme) => `1px solid ${theme.palette.border.modal}`,
        }}
      >
        <Box display={"flex"}>
          {onBack && (
            <Box display={"flex"} sx={{ paddingY: 3 }}>
              <BackButton onClick={onBack} sx={{ marginLeft: 2 }} />
            </Box>
          )}
          <DialogTitle>Atributos de la sucursal</DialogTitle>
        </Box>
        <Box display={"flex"} sx={{ paddingY: 3 }}>
          <XButton
            onClick={onClose}
            sx={{
              marginRight: 2,
              ...(isMobile && {
                backgroundColor: "grey.400",
                borderRadius: "6px",
                "&:hover": { backgroundColor: "grey.400" },
              }),
            }}
          />
        </Box>
      </Box>

      <Formik
        initialValues={{ attributes: initialAttributes }}
        // Si se desea, se puede agregar validación con Yup aquí.
        validationSchema={Yup.object({})}
        onSubmit={(values) => {
          onSubmit(values.attributes);
          onClose();
        }}
      >
        {({ values, setFieldValue, isValid, dirty }) => (
          <Form
            style={
              isMobile
                ? { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }
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
              <Box
                sx={{
                  display: "grid",
                  gridAutoFlow: "column", // Llenar las columnas en vertical
                  gridTemplateRows: "repeat(5, auto)", // Cada columna tendrá 5 filas
                  gap: 2,
                }}
              >
                {attributes.map((attr) => {
                  // Verifica si el atributo ya está en el array
                  const isChecked = values.attributes.some(
                    (a: any) => a.id === attr.id
                  );
                  return (
                    <FormControlLabel
                      key={attr.id}
                      control={
                        <Switch
                          name="attributes"
                          checked={isChecked}
                          onChange={(event) => {
                            const attributeObject = {
                              id: attr.id,
                              name: attr.name,
                            };
                            if (event.target.checked) {
                              // Agrega el objeto atributo al array
                              setFieldValue("attributes", [
                                ...values.attributes,
                                attributeObject,
                              ]);
                            } else {
                              // Remueve el objeto atributo del array
                              setFieldValue(
                                "attributes",
                                values.attributes.filter(
                                  (a: any) => a.id !== attr.id
                                )
                              );
                            }
                          }}
                        />
                      }
                      label={attr.name}
                    />
                  );
                })}
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.border.modal}`,
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
      </InsetSurface>
    </Dialog>
  );
};

export default AttributesModal;
