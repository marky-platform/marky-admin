import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Radio,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Category } from "../../../../types/category";
// import categoryIcons from "../../../assets/icons/category/categoryIcons";
import categoryIcons from "../../../../assets/icons/category/categoryIcons";
import { ReactComponent as CrownIcon } from "../../../../assets/icons/crown.svg";
import { Form, Formik, useFormikContext } from "formik";
import * as Yup from "yup";
import Input from "../../../../components/Input";
import { useEffect } from "react";
import useAddPromotionToProductCategory from "../../../../hooks/useAddPromotionToProductCategory";

const DISCOUNT_PERCENTAGE_OPTIONS = [5, 10, 15, 20, 30, 40, 50];
const MULTIBUY_OPTIONS = ["2x1", "3x2", "4x3"];

const getIconComponent = (cat: Category) => {
  const IconComponent =
    cat.icon && categoryIcons[cat.icon] ? categoryIcons[cat.icon] : null;

  return IconComponent ? (
    <IconComponent width={24} height={24} />
  ) : (
    <CrownIcon width={24} height={24} />
  );
};

interface PromotionProps {
  category: Category | undefined;
  onSubmit: (updatedCategory: Category) => void;
}

const initialValues = {
  isPromotionActive: false,
  promotionOption: "", // 'descuento' o 'oferta'
  discountPercentage: undefined,
  multibuyOption: "",
  countdownActive: false,
  promotionDateStart: "",
  promotionTimeStart: "",
  promotionDateEnd: "",
  promotionTimeEnd: "",
};

const validationSchema = Yup.object({
  isPromotionActive: Yup.boolean(),

  // Not required: a promotion can consist of just a countdown (no
  // descuento/oferta), so forcing this field blocked "Guardar/Crear"
  // (it always showed as disabled) whenever the user only wanted to
  // schedule a "cuenta regresiva" without picking a discount type.
  promotionOption: Yup.string().notRequired(),

  discountPercentage: Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    )
    .when("promotionOption", {
      is: "descuento",
      then: (schema) =>
        schema
          .required("Debe seleccionar un porcentaje")
          .oneOf(
            DISCOUNT_PERCENTAGE_OPTIONS,
            "Selecciona uno de los porcentajes disponibles"
          ),
      otherwise: (schema) => schema.nullable(),
    }),

  multibuyOption: Yup.string().when("promotionOption", {
    is: "oferta",
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

    return true; // ya será validado por campos requeridos
  }
);

export const Promotion: React.FC<PromotionProps> = ({ category, onSubmit }) => {
  const addPromotionMutation = useAddPromotionToProductCategory();

  const PromotionInitializer = ({
    category,
  }: {
    category: Category | undefined;
  }) => {
    const { setFieldValue } = useFormikContext<any>();

    useEffect(() => {
      if (!category) return;

      const hasPromotion =
        category.hasOffer || (category.discountPercentage ?? 0) > 0;

      console.log("Promotion category hasPromotion", hasPromotion);

      if (hasPromotion) {
        setFieldValue("isPromotionActive", true);

        if (category.hasOffer) {
          setFieldValue("promotionOption", "oferta");
          if (category.multibuyOption) {
            setFieldValue("multibuyOption", category.multibuyOption);
          }
        } else if (
          category.discountPercentage &&
          category.discountPercentage > 0
        ) {
          setFieldValue("promotionOption", "descuento");
          setFieldValue("discountPercentage", category.discountPercentage);
        }

        if (category.promotionStartsAt && category.promotionEndsAt) {
          const [startDate, startTime] = category.promotionStartsAt
            .split("T")
            .map((v, i) => (i === 1 ? v.slice(0, 5) : v));
          const [endDate, endTime] = category.promotionEndsAt
            .split("T")
            .map((v, i) => (i === 1 ? v.slice(0, 5) : v));

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

  const onSubmitLocal = (values: any) => {
    let dataToSubmit = { ...values };

    // Si la promo está desactivada, limpiar todo
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
      const start = `${values.promotionDateStart}T${values.promotionTimeStart}`;
      const end = `${values.promotionDateEnd}T${values.promotionTimeEnd}`;

      dataToSubmit.promotionStartsAt = start;
      dataToSubmit.promotionEndsAt = end;
    }

    // Opcional: eliminar los campos individuales de fecha/hora si no son necesarios
    delete dataToSubmit.promotionDateStart;
    delete dataToSubmit.promotionTimeStart;
    delete dataToSubmit.promotionDateEnd;
    delete dataToSubmit.promotionTimeEnd;

    console.log("Final data:", dataToSubmit);

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
        promotion_starts_at: dataToSubmit.promotionStartsAt,
        promotion_ends_at: dataToSubmit.promotionEndsAt,
      };
    }

    if (category) {
      addPromotionMutation.mutate(
        { id: category.id as number, promotion: promotionPayload },
        {
          onSuccess: (data) => {
            const mappedData: Category = {
              id: data.id,
              label: data.name,
              icon: data.icon,
              order: 0, // default order
              hasOffer: !!data.multibuy_option,
              discountPercentage: parseFloat(data.discount_percentage),
              multibuyOption: data.multibuy_option ?? undefined,
              promotionStartsAt: data.promotion_starts_at ?? undefined,
              promotionEndsAt: data.promotion_ends_at ?? undefined,
            };
            onSubmit(mappedData);
          },
        }
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmitLocal}
      enableReinitialize
    >
      {({ values, setFieldValue, isValid }) => {
        return (
          <Form>
            <PromotionInitializer category={category} />
            <Box>
              {/* Row con icono y nombre de la categoría */}
              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                mb={2}
                sx={{ boxShadow: (theme) => `0px 1px 0px ${theme.palette.border.layout}`, pb: 2 }}
              >
                {category && (
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      bgcolor: "surface.muted",
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {getIconComponent(category)}
                  </Box>
                )}
                <Typography sx={{ fontSize: 14, color: "text.title" }}>
                  {category?.label || "Categoría"}
                </Typography>
              </Box>

              {/* ================== Sección Promoción ================ */}
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: "text.strong" }} mb={1}>
                Promoción
              </Typography>
              <Box display="flex" flexDirection={"column"} gap={2} mb={2}>
                <Box display={"flex"} flexDirection={"column"}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="isPromotionActive"
                        checked={values.isPromotionActive}
                        onChange={(e) =>
                          setFieldValue("isPromotionActive", e.target.checked)
                        }
                      />
                    }
                    label="Activar promoción"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "text.body" } }}
                  />

                  {values.isPromotionActive && (
                    <>
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
                        sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "text.body" } }}
                      />
                      {values.promotionOption === "descuento" && (
                        <FormControl
                          size="small"
                          sx={{
                            mb: 2,
                            ml: 8,
                            width: { xs: "100%", md: "50%" },
                          }}
                        >
                          <Select
                            displayEmpty
                            value={values.discountPercentage ?? ""}
                            onChange={(e) =>
                              setFieldValue(
                                "discountPercentage",
                                Number(e.target.value)
                              )
                            }
                            renderValue={(value) =>
                              value === "" ? (
                                <Typography sx={{ fontSize: 14, color: "text.muted" }}>
                                  Selecciona un porcentaje
                                </Typography>
                              ) : (
                                <Box
                                  component="span"
                                  sx={{
                                    bgcolor: "accent.danger",
                                    color: "fixed.white",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    borderRadius: 0.5,
                                    px: 1.5,
                                    py: 0.5,
                                  }}
                                >
                                  -{value}%
                                </Box>
                              )
                            }
                            sx={{
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "border.input",
                              },
                            }}
                          >
                            {DISCOUNT_PERCENTAGE_OPTIONS.map((option) => (
                              <MenuItem key={option} value={option}>
                                -{option}%
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </>
                  )}
                </Box>

                {values.isPromotionActive && (
                  <>
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
                      sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "text.body" } }}
                    />
                    {values.promotionOption === "oferta" && (
                      <FormControl
                        size="small"
                        sx={{
                          mb: 2,
                          ml: 8,
                          width: { xs: "100%", md: "50%" },
                        }}
                      >
                        <Select
                          value={values.multibuyOption}
                          onChange={(e) =>
                            setFieldValue("multibuyOption", e.target.value)
                          }
                          sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "border.input",
                            },
                          }}
                        >
                          {MULTIBUY_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}
              </Box>

              {/* Sección Tiempo limitado */}
              {values.isPromotionActive && (
                <>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: "text.strong" }} mb={1}>
                    Tiempo limitado
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        name="countdownActive"
                        checked={values.countdownActive}
                        onChange={(e) =>
                          setFieldValue("countdownActive", e.target.checked)
                        }
                      />
                    }
                    label="Activar cuenta regresiva"
                    sx={{ "& .MuiFormControlLabel-label": { fontSize: 14, color: "text.body" } }}
                  />

                  {values.countdownActive && (
                    <Box
                      display="flex"
                      justifyContent={"space-between"}
                      flexDirection={"column"}
                      gap={2}
                    >
                      <Box display={"flex"} gap={2} flex={1}>
                        <Input
                          placeholder="Fecha inicio"
                          type="date"
                          value={values.promotionDateStart}
                          onChange={(e) =>
                            setFieldValue("promotionDateStart", e.target.value)
                          }
                          label={"Fecha Inicio"}
                          sx={{ flex: 2 }}
                        />
                        <Input
                          label="Hora inicio"
                          type="time"
                          value={values.promotionTimeStart}
                          onChange={(e) =>
                            setFieldValue("promotionTimeStart", e.target.value)
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <Box display={"flex"} gap={2} flex={1}>
                        <Input
                          placeholder="Fecha Fin"
                          type="date"
                          value={values.promotionDateEnd}
                          onChange={(e) =>
                            setFieldValue("promotionDateEnd", e.target.value)
                          }
                          label={"Fecha fin"}
                          sx={{ flex: 2 }}
                        />
                        <Input
                          label="Hora Fin"
                          type="time"
                          value={values.promotionTimeEnd}
                          onChange={(e) =>
                            setFieldValue("promotionTimeEnd", e.target.value)
                          }
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Box>
                  )}
                </>
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 4 }}
                type="submit"
                disabled={!isValid}
              >
                Guardar/Crear
              </Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};
