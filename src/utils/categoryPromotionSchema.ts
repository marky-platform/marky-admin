import * as Yup from "yup";

export const categoryPromotionValidationSchema = Yup.object({
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
  "La fecha y hora son inválidas o la de fin no es posterior al inicio",
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
      // Fecha/hora inválidas (NaN) no son válidas: antes `end > start` daba
      // false con NaN pero solo si ambos campos estaban completos; ahora se
      // rechaza explícitamente para que el submit nunca llegue a toISOString.
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
      return end > start;
    }

    return true;
  },
);
