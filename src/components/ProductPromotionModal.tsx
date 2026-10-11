import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import XButton from "./XButton";
import InsetSurface from "../themes/InsetSurface";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Radio,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import Input from "./Input";
import { ProductGridItem } from "../types/product";
import useUpdateProductPromotion from "../hooks/useUpdateProductPromotion";
import {
  toIsoDateTime,
  splitIsoDateTime,
  buildPromotionClearPayload,
  sanitizeDiscountInput,
} from "../utils/promotionForm";

interface Props {
  open: boolean;
  product?: ProductGridItem | null;
  onClose: () => void;
}

const defaultInitialValues = {
  isPromotionActive: false,
  promotionOption: "",
  discountPercentage: undefined,
  multibuyOption: "",
  countdownActive: false,
  promotionDateStart: "",
  promotionTimeStart: "",
  promotionDateEnd: "",
  promotionTimeEnd: "",
};

// Derives Formik's real initial values from the product's current promotion
// (if any) so `dirty` reflects actual pending edits from the moment the
// modal mounts, instead of comparing live values against these hardcoded
// defaults regardless of what was hydrated in afterward.
const buildInitialValues = (product?: ProductGridItem | null) => {
  const hasPromotion = !!(
    product?.multibuyOption ||
    (product?.discountPercent ?? 0) !== 0 ||
    product?.promotionStartsAt ||
    product?.promotionEndsAt
  );

  if (!hasPromotion) {
    return { ...defaultInitialValues };
  }

  const { date: promotionDateStart, time: promotionTimeStart } =
    splitIsoDateTime(product?.promotionStartsAt);
  const { date: promotionDateEnd, time: promotionTimeEnd } = splitIsoDateTime(
    product?.promotionEndsAt,
  );

  // Neither branch applies for a countdown-only promotion (dates set, no
  // discount/multibuy configured) — promotionOption/discountPercentage stay
  // at their unset defaults, same as the promotion switch alone.
  let promotionOption: "" | "descuento" | "oferta" = "";
  let discountPercentage: number | undefined;
  if (product?.multibuyOption) {
    promotionOption = "oferta";
  } else if (product?.discountPercent && product.discountPercent !== 0) {
    promotionOption = "descuento";
    discountPercentage = Number(product.discountPercent);
  }

  return {
    isPromotionActive: true,
    promotionOption,
    discountPercentage,
    multibuyOption: product?.multibuyOption ?? "",
    countdownActive: !!(
      product?.promotionStartsAt && product?.promotionEndsAt
    ),
    promotionDateStart,
    promotionTimeStart,
    promotionDateEnd,
    promotionTimeEnd,
  };
};

const validationSchema = Yup.object({
  isPromotionActive: Yup.boolean(),
  // Required whenever the promotion switch is enabled: "Descuento" or
  // "Oferta" must be picked, otherwise the promotion has no actual effect
  // (a countdown alone doesn't discount anything).
  promotionOption: Yup.string().when("isPromotionActive", {
    is: true,
    then: (schema) => schema.required("Debes seleccionar Descuento u Oferta"),
    otherwise: (schema) => schema.notRequired(),
  }),
  discountPercentage: Yup.number()
    .transform((value, original) =>
      String(original).trim() === "" ? null : value,
    )
    // Gated on isPromotionActive too (not just promotionOption): otherwise a
    // stale "descuento" left over from before the switch was turned off
    // keeps this required forever, even though the field is hidden and the
    // switch being off should lift the requirement entirely.
    .when(["isPromotionActive", "promotionOption"], {
      is: (isPromotionActive: boolean, promotionOption: string) =>
        isPromotionActive && promotionOption === "descuento",
      then: (schema) =>
        schema
          .required("Debe ingresar un porcentaje")
          .min(1, "Mínimo 1%")
          .max(100, "Máximo 100%"),
      otherwise: (schema) => schema.nullable(),
    }),
  multibuyOption: Yup.string().when(["isPromotionActive", "promotionOption"], {
    is: (isPromotionActive: boolean, promotionOption: string) =>
      isPromotionActive && promotionOption === "oferta",
    then: (schema) => schema.required("Debe seleccionar una opción de oferta"),
    otherwise: (schema) => schema.notRequired(),
  }),
  countdownActive: Yup.boolean(),
  promotionDateStart: Yup.string().when("countdownActive", {
    is: true,
    then: (schema) => schema.required("Debe ingresar la fecha de inicio"),
    otherwise: (schema) => schema.nullable(),
  }),
  promotionTimeStart: Yup.string().when("countdownActive", {
    is: true,
    then: (schema) => schema.required("Debe ingresar la hora de inicio"),
    otherwise: (schema) => schema.nullable(),
  }),
  promotionDateEnd: Yup.string().when("countdownActive", {
    is: true,
    then: (schema) => schema.required("Debe ingresar la fecha de fin"),
    otherwise: (schema) => schema.nullable(),
  }),
  promotionTimeEnd: Yup.string().when("countdownActive", {
    is: true,
    then: (schema) => schema.required("Debe ingresar la hora de fin"),
    otherwise: (schema) => schema.nullable(),
  }),
}).test(
  "fecha-valida",
  "La fecha y hora de fin deben ser posteriores al inicio",
  function (values) {
    const {
      countdownActive,
      promotionDateStart,
      promotionTimeStart,
      promotionDateEnd,
      promotionTimeEnd,
    } = values as any;

    if (!countdownActive) return true;

    if (
      promotionDateStart &&
      promotionTimeStart &&
      promotionDateEnd &&
      promotionTimeEnd
    ) {
      const start = new Date(`${promotionDateStart}T${promotionTimeStart}`);
      const end = new Date(`${promotionDateEnd}T${promotionTimeEnd}`);
      return end > start;
    }

    return true;
  },
);

const ProductPromotionModalContent: React.FC<Props> = ({ open, product, onClose }) => {
  const updateProductPromotion = useUpdateProductPromotion();
  const hasExistingPromotion = !!(
    product?.multibuyOption ||
    (product?.discountPercent ?? 0) !== 0 ||
    product?.promotionStartsAt ||
    product?.promotionEndsAt
  );

  const onSubmitLocal = (values: any) => {
    let promotionPayload: ReturnType<typeof buildPromotionClearPayload>;

    if (!values.isPromotionActive) {
      promotionPayload = buildPromotionClearPayload();
    } else {
      // "" (not null) for anything not selected/enabled — objectToFormData
      // drops null/undefined silently, so only an explicit empty string
      // actually clears a previous value server-side (see utils/formData.ts
      // and ProductInputSerializer.to_internal_value).
      const dates = values.countdownActive
        ? {
            promotion_starts_at:
              toIsoDateTime(
                values.promotionDateStart,
                values.promotionTimeStart,
              ) ?? "",
            promotion_ends_at:
              toIsoDateTime(values.promotionDateEnd, values.promotionTimeEnd) ??
              "",
          }
        : { promotion_starts_at: "", promotion_ends_at: "" };

      promotionPayload = {
        discount_percentage:
          values.promotionOption === "descuento"
            ? Number(values.discountPercentage)
            : 0,
        multibuy_option:
          values.promotionOption === "oferta" ? values.multibuyOption : "",
        ...dates,
      };
    }

    if (product?.id) {
      updateProductPromotion.mutate(
        { id: Number(product.id), promotion: promotionPayload },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!updateProductPromotion.isPending) onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            borderBottom: (theme) => `1px solid ${theme.palette.border.modal}`,
          }}
        >
          <Box display={"flex"} alignItems="center">
            <Box sx={{ pl: 4, py: 4, display: "flex", alignItems: "center" }}>
              <Box component="h2" sx={{ m: 0, fontSize: 18 }}>
                Promoción del producto
              </Box>
            </Box>
          </Box>
          <Box display={"flex"} sx={{ py: 1 }}>
            <XButton onClick={() => onClose()} sx={{ marginRight: 2 }} />
          </Box>
        </Box>
        <DialogContent>
          <Formik
            initialValues={buildInitialValues(product)}
            validationSchema={validationSchema}
            onSubmit={onSubmitLocal}
            enableReinitialize
          >
            {({ values, setFieldValue, setValues, isValid, errors, dirty }) => (
              <Form>
                <Box sx={{ p: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isPromotionActive"
                        checked={values.isPromotionActive}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          // A single setValues call, not two setFieldValue
                          // calls: Formik resolves each setFieldValue's
                          // validation against the pre-update state.values
                          // snapshot plus only that one field, so two calls
                          // in the same handler race — the second one's
                          // validation doesn't see the first one's change
                          // yet and can silently overwrite it with stale
                          // (invalid) results.
                          setValues((prev: any) => ({
                            ...prev,
                            isPromotionActive: checked,
                            promotionOption:
                              checked && !prev.promotionOption
                                ? "descuento"
                                : prev.promotionOption,
                          }));
                        }}
                      />
                    }
                    label="Activar promoción"
                  />

                  {product?.promotionStatus === "expired" && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Esta promoción ya finalizó.
                    </Alert>
                  )}

                  {values.isPromotionActive && (
                    <Box
                      ml={0}
                      mt={2}
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {errors.promotionOption && (
                        <Typography variant="caption" color="error.main">
                          {errors.promotionOption as string}
                        </Typography>
                      )}
                      <FormControlLabel
                        control={
                          <Radio
                            name="promotionOption"
                            value="descuento"
                            checked={values.promotionOption === "descuento"}
                            onChange={() =>
                              setFieldValue("promotionOption", "descuento")
                            }
                          />
                        }
                        label="Descuento"
                      />
                      {values.promotionOption === "descuento" && (
                        <TextField
                          placeholder="Porcentaje de descuento (0-100)"
                          type="text"
                          inputMode="numeric"
                          name="discountPercentage"
                          variant="outlined"
                          size="small"
                          value={values.discountPercentage || ""}
                          onChange={(e) => setFieldValue(
                            "discountPercentage",
                            sanitizeDiscountInput(e.target.value),
                          )}
                          inputProps={{
                            max: 100,
                            min: 0,
                            style: { padding: 12 },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography>%</Typography>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ mb: 2, width: { xs: "100%", md: "50%" } }}
                        />
                      )}

                      <FormControlLabel
                        control={
                          <Radio
                            name="promotionOption"
                            value="oferta"
                            checked={values.promotionOption === "oferta"}
                            onChange={() =>
                              setFieldValue("promotionOption", "oferta")
                            }
                          />
                        }
                        label="Oferta"
                      />
                      {values.promotionOption === "oferta" && (
                        <FormControl
                          size="small"
                          sx={{ mb: 2, width: { xs: "100%", md: "50%" } }}
                        >
                          <Select
                            value={values.multibuyOption}
                            onChange={(e) =>
                              setFieldValue("multibuyOption", e.target.value)
                            }
                          >
                            <MenuItem value="2x1">2x1</MenuItem>
                            <MenuItem value="3x2">3x2</MenuItem>
                          </Select>
                        </FormControl>
                      )}

                      <Box mt={2}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="countdownActive"
                              checked={values.countdownActive}
                              onChange={(e) =>
                                setFieldValue(
                                  "countdownActive",
                                  e.target.checked,
                                )
                              }
                            />
                          }
                          label="Activar cuenta regresiva"
                        />

                        {values.countdownActive && (
                          <Box
                            display="flex"
                            flexDirection="column"
                            gap={2}
                            mt={1}
                          >
                            <Box display="flex" gap={2}>
                              <Input
                                type="date"
                                value={values.promotionDateStart}
                                onChange={(e: any) =>
                                  setFieldValue(
                                    "promotionDateStart",
                                    e.target.value,
                                  )
                                }
                                label="Fecha Inicio"
                                sx={{ flex: 2 }}
                              />
                              <Input
                                type="time"
                                value={values.promotionTimeStart}
                                onChange={(e: any) =>
                                  setFieldValue(
                                    "promotionTimeStart",
                                    e.target.value,
                                  )
                                }
                                label="Hora inicio"
                                sx={{ flex: 1 }}
                              />
                            </Box>
                            <Box display="flex" gap={2}>
                              <Input
                                type="date"
                                value={values.promotionDateEnd}
                                onChange={(e: any) =>
                                  setFieldValue(
                                    "promotionDateEnd",
                                    e.target.value,
                                  )
                                }
                                label="Fecha fin"
                                sx={{ flex: 2 }}
                              />
                              <Input
                                type="time"
                                value={values.promotionTimeEnd}
                                onChange={(e: any) =>
                                  setFieldValue(
                                    "promotionTimeEnd",
                                    e.target.value,
                                  )
                                }
                                label="Hora Fin"
                                sx={{ flex: 1 }}
                              />
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  <Box mt={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      fullWidth
                      disabled={
                        !isValid ||
                        updateProductPromotion.isPending ||
                        (hasExistingPromotion && !dirty)
                      }
                    >
                      {updateProductPromotion.isPending
                        ? "Guardando..."
                        : hasExistingPromotion
                          ? "Guardar cambios"
                          : "Crear promoción"}
                    </Button>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </>
    </Dialog>
  );
};

// Fields inside a modal read as inset in dark mode (see InsetSurface).
const ProductPromotionModal: React.FC<Props> = (props) => (
  <InsetSurface>
    <ProductPromotionModalContent {...props} />
  </InsetSurface>
);

export default ProductPromotionModal;
