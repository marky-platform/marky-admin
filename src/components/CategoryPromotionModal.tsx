import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@mui/material";
import XButton from "./XButton";
import InsetSurface from "../themes/InsetSurface";
import { Formik, Form, useFormikContext } from "formik";
import {
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
import Input from "../components/Input";
import categoryIcons from "../assets/icons/category/categoryIcons";
import { ReactComponent as CrownIcon } from "../assets/icons/crown.svg";
import { CategoryWithProducts } from "../types/categoryWithProducts";
import { useApiMutation } from "../hooks/useApiMutation";
import { addPromotionToProductCategory } from "../services/productService";
import { useQueryClient } from "@tanstack/react-query";
import { ShowNotification } from "../utils/utils";
import { categoryPromotionValidationSchema } from "../utils/categoryPromotionSchema";
import {
  sanitizeDiscountInput,
  splitIsoDateTime,
  toIsoDateTime,
} from "../utils/promotionForm";

interface Props {
  open: boolean;
  category?: CategoryWithProducts | null;
  onClose: () => void;
}

const initialValues = {
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

const PromotionInitializer: React.FC<{
  category?: CategoryWithProducts | null;
}> = ({ category }) => {
  const { setFieldValue } = useFormikContext<any>();

  useEffect(() => {
    if (!category) return;

    const hasPromotion = !!(
      category.multibuy_option || (category.discount_percentage ?? "0") !== "0"
    );

    if (hasPromotion) {
      setFieldValue("isPromotionActive", true);

      if (category.multibuy_option) {
        setFieldValue("promotionOption", "oferta");
        setFieldValue("multibuyOption", category.multibuy_option);
      } else if (
        category.discount_percentage &&
        category.discount_percentage !== "0"
      ) {
        setFieldValue("promotionOption", "descuento");
        setFieldValue(
          "discountPercentage",
          Number(category.discount_percentage),
        );
      }

      if (category.promotion_starts_at && category.promotion_ends_at) {
        // Misma base local que la ruta de productos (F-29): el servidor envía un
        // instante ISO con offset y los inputs muestran la hora local del navegador.
        const { date: startDate, time: startTime } = splitIsoDateTime(
          category.promotion_starts_at,
        );
        const { date: endDate, time: endTime } = splitIsoDateTime(
          category.promotion_ends_at,
        );

        setFieldValue("countdownActive", true);
        setFieldValue("promotionDateStart", startDate);
        setFieldValue("promotionTimeStart", startTime);
        setFieldValue("promotionDateEnd", endDate);
        setFieldValue("promotionTimeEnd", endTime);
      }
    }
  }, [category, setFieldValue]);

  return null;
};

const CategoryPromotionModalContent: React.FC<Props> = ({
  open,
  category,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const addPromotionMutation = useApiMutation<
    any,
    any,
    { id: number; promotion: any }
  >({
    mutationFn: ({ id, promotion }: { id: number; promotion: any }) =>
      addPromotionToProductCategory(id, promotion),
    successMessage: "Promoción guardada exitosamente",
    errorMessage: "Error al guardar la promoción",
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productCategoriesWithProducts"],
      });
      onClose();
    },
  });

  const onSubmitLocal = (values: any) => {
    let dataToSubmit = { ...values };

    if (!values.isPromotionActive) {
      dataToSubmit = {
        isPromotionActive: false,
        promotionOption: "",
        discountPercentage: null,
        countdownActive: false,
        promotionDateStart: "",
        promotionTimeStart: "",
        promotionDateEnd: "",
        promotionTimeEnd: "",
      };
    } else if (values.countdownActive) {
      // Instante ISO con offset explícito (como en productos), no "YYYY-MM-DDTHH:mm"
      // naive que el servidor interpretaría en hora de Asunción.
      const start = toIsoDateTime(
        values.promotionDateStart,
        values.promotionTimeStart,
      );
      const end = toIsoDateTime(
        values.promotionDateEnd,
        values.promotionTimeEnd,
      );

      // Defensa en profundidad: la validación ya rechaza fechas inválidas, pero
      // si alguna llegara aquí (toIsoDateTime devuelve null) no se envía nada.
      if (!start || !end) {
        ShowNotification({
          message: "La fecha y hora ingresadas no son válidas",
          type: "error",
        });
        return;
      }

      dataToSubmit.promotionStartsAt = start;
      dataToSubmit.promotionEndsAt = end;
    }

    delete dataToSubmit.promotionDateStart;
    delete dataToSubmit.promotionTimeStart;
    delete dataToSubmit.promotionDateEnd;
    delete dataToSubmit.promotionTimeEnd;

    let promotionPayload;

    if (!values.isPromotionActive) {
      promotionPayload = {
        has_offer: false,
        discount_percentage: "0",
        multibuy_option: null,
        promotion_starts_at: null,
        promotion_ends_at: null,
      };
    } else {
      promotionPayload = {
        has_offer: dataToSubmit.promotionOption === "oferta",
        discount_percentage:
          dataToSubmit.promotionOption === "descuento"
            ? String(dataToSubmit.discountPercentage)
            : "0",
        multibuy_option:
          dataToSubmit.promotionOption === "oferta"
            ? dataToSubmit.multibuyOption
            : null,
        promotion_starts_at: dataToSubmit.promotionStartsAt ?? null,
        promotion_ends_at: dataToSubmit.promotionEndsAt ?? null,
      };
    }

    if (category) {
      addPromotionMutation.mutate({
        id: category.id,
        promotion: promotionPayload,
      });
    } else {
      ShowNotification({ message: "Categoría inválida", type: "error" });
    }
  };

  // Resolve category icon component (some filenames use dashes -> camelCase keys)
  const IconComponent = category?.icon
    ? (categoryIcons as any)[
        category.icon.replace(/-([a-z])/g, (_m: string, p: string) =>
          p.toUpperCase(),
        )
      ]
    : undefined;

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!addPromotionMutation.isPending) onClose();
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
            <Box sx={{ pl: 1, display: "flex", alignItems: "center" }}>
              <Box component="h2" sx={{ m: 0, fontSize: 18 }}>
                Promoción
              </Box>
            </Box>
          </Box>
          <Box display={"flex"} sx={{ py: 1 }}>
            <XButton onClick={() => onClose()} sx={{ marginRight: 2 }} />
          </Box>
        </Box>
        <DialogContent>
          <Formik
            initialValues={initialValues}
            validationSchema={categoryPromotionValidationSchema}
            onSubmit={onSubmitLocal}
            enableReinitialize
          >
            {({ values, setFieldValue, setValues, isValid, errors }) => (
              <Form>
                <PromotionInitializer category={category} />
                <Box sx={{ p: 2 }}>
                  {/* Category header: icon + name (matches CategoryAdminModal styling) */}
                  {category && (
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        mb: 2,
                        p: 1,
                        border: (theme) => `1px solid ${theme.palette.border.light}`,
                        borderRadius: 1,
                        backgroundColor: "grey.50",
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "surface.inset",
                          borderRadius: 1,
                          boxShadow: (theme) =>
                            `0 1px 0 ${theme.palette.shadow.hairline}`,
                          mr: 2,
                        }}
                      >
                        {IconComponent ? (
                          <IconComponent width={20} height={20} />
                        ) : (
                          <CrownIcon width={20} height={20} />
                        )}
                      </Box>
                      <Typography variant="subtitle1">
                        {category.name}
                      </Typography>
                    </Box>
                  )}

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
                                onChange={(e) =>
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
                                onChange={(e) =>
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
                                onChange={(e) =>
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
                                onChange={(e) =>
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
                        !isValid || addPromotionMutation.isPending
                      }
                    >
                      {addPromotionMutation.isPending
                        ? "Guardando..."
                        : "Guardar/Crear"}
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
const CategoryPromotionModal: React.FC<Props> = (props) => (
  <InsetSurface>
    <CategoryPromotionModalContent {...props} />
  </InsetSurface>
);

export default CategoryPromotionModal;
