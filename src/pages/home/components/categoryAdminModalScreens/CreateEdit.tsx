import { Box, TextField, Typography, Button } from "@mui/material";
import categoryIcons from "../../../../assets/icons/category/categoryIcons";
import { Category } from "../../../../types/category";
import * as Yup from "yup";
import { Form, Formik, FormikHelpers } from "formik";
import useCreateProductCategory from "../../../../hooks/useCreateProductCategory";
import useUpdateProductCategory from "../../../../hooks/useUpdateProductCategory";
import { ShowNotification } from "../../../../utils/utils";

interface CreateEditProps {
  /** if editing, the category you want to load; otherwise undefined for “create” */
  initialCategory?: Category | null;
  /** will be called with the new/updated category */
  onSubmit: (category: Category, backScreen: boolean) => void;
  /** hides "Guardar y crear otra" (e.g. when the modal closes after creating) */
  hideCreateAnother?: boolean;
}

interface FormValues {
  name: string;
  icon: string;
}

export const CreateEdit: React.FC<CreateEditProps> = ({
  initialCategory,
  onSubmit,
  hideCreateAnother = false,
}) => {
  const createProductCategory = useCreateProductCategory();
  const updateProductCategory = useUpdateProductCategory();
  const iconKeys = Object.keys(categoryIcons);
  const isEdit = Boolean(initialCategory);

  const validationSchema = Yup.object({
    name: Yup.string().required("El nombre es obligatorio"),
    icon: Yup.string().required("Selecciona un ícono"),
  });

  const handleSubmit = (
    values: FormValues,
    formikHelpers: FormikHelpers<FormValues>,
  ) => {
    const payload = {
      name: values.name,
      icon: values.icon,
    };

    if (isEdit && initialCategory) {
      updateProductCategory.mutate(
        { id: initialCategory.id as number, category: payload },
        {
          onSuccess: (data) => {
            const mappedData: Category = {
              id: data.id,
              label: data.name,
              icon: data.icon,
              order: 0, // default order
              hasOffer: !!data.multibuy_option,
              multibuyOption: data.multibuy_option ?? undefined,
              discountPercentage: parseFloat(data.discount_percentage),
              promotionStartsAt: data.promotion_starts_at ?? undefined,
              promotionEndsAt: data.promotion_ends_at ?? undefined,
            };
            onSubmit(mappedData, true);
            formikHelpers.resetForm();
          },
          onError: (error: any) => {
            ShowNotification({
              message: error?.message || "No se pudo editar la categoría",
              type: "error",
            });
          },
        },
      );
    } else {
      createProductCategory.mutate(payload, {
        onSuccess: (data) => {
          const mappedData: Category = {
            id: data.id,
            label: data.name,
            icon: data.icon,
            order: 0, // default order
            hasOffer: !!data.multibuy_option,
            multibuyOption: data.multibuy_option ?? undefined,
            discountPercentage: parseFloat(data.discount_percentage),
            promotionStartsAt: data.promotion_starts_at ?? undefined,
            promotionEndsAt: data.promotion_ends_at ?? undefined,
          };
          onSubmit(mappedData, true);
          formikHelpers.resetForm();
        },
        onError: (error: any) => {
          ShowNotification({
            message: error?.message || "No se pudo crear la categoría",
            type: "error",
          });
        },
      });
    }
  };

  // useEffect(() => {
  //   console.log("===initialCategory===", initialCategory);
  //   setInitialValues(initialCategory);
  // }, [initialCategory]);

  return (
    <Formik
      initialValues={{
        name: initialCategory?.label ?? "",
        icon: initialCategory?.icon ?? "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        setFieldValue,
        isValid,
        resetForm,
      }) => (
        <Form>
          {/* <FormResetter category={initialCategory} /> */}
          {/* Name input */}
          <Box mb={4}>
            <Typography
              component="label"
              sx={{ fontSize: 14, fontWeight: 700, color: "#333" }}
            >
              Nombre de la categoría{" "}
              <Box component="span" sx={{ color: "#FF3E3E" }}>
                *
              </Box>
            </Typography>
            <TextField
              fullWidth
              name="name"
              placeholder="Ej. Bebidas"
              variant="outlined"
              value={values.name}
              onChange={handleChange}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
              sx={{
                mt: 0.5,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "grey.800",
                },
              }}
            />
          </Box>

          {/* Icon picker */}
          <Typography
            sx={{ fontSize: 14, fontWeight: 700, color: "#333" }}
            mb={2}
          >
            Íconos disponibles ({iconKeys.length})
          </Typography>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={"14px 12px"}
            mb={2}
            sx={{
              border: 1,
              borderColor: "#E0E0E0",
              borderRadius: 1.5,
              p: 3,
            }}
          >
            {iconKeys.map((key) => {
              const IconComponent = categoryIcons[key];
              const isSelected = values.icon === key;
              return (
                <Box
                  key={key}
                  onClick={() => setFieldValue("icon", key)}
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: isSelected ? "secondary.main" : "transparent",
                    borderRadius: 1.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconComponent width={44} height={44} />
                </Box>
              );
            })}
          </Box>
          {touched.icon && errors.icon && (
            <Typography color="error" variant="caption">
              {errors.icon}
            </Typography>
          )}

          {/* Actions */}
          <Box
            display="flex"
            flexDirection="column"
            gap={3}
            mt={5}
            pt={4}
            sx={{ boxShadow: "0px -1px 0px #E8E9EB" }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!isValid}
              sx={{ boxShadow: 0 }}
            >
              {isEdit ? "Guardar cambios" : "Crear categoría"}
            </Button>

            {!isEdit && !hideCreateAnother && (
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                disabled={!isValid}
                sx={{
                  backgroundColor: "grey.400",
                  color: "#4B4B4B",
                  boxShadow: 0,
                }}
                // onClick={() => {
                //   // submit and then stay on the same form
                onClick={() => {
                  const payload = {
                    name: values.name,
                    icon: values.icon,
                  };
                  createProductCategory.mutate(payload, {
                    onSuccess: (data) => {
                      const mappedData: Category = {
                        id: data.id,
                        label: data.name,
                        icon: data.icon,
                        order: 0, // default order
                        hasOffer: !!data.multibuy_option,
                        multibuyOption: data.multibuy_option ?? undefined,
                        discountPercentage: parseFloat(
                          data.discount_percentage,
                        ),
                        promotionStartsAt:
                          data.promotion_starts_at ?? undefined,
                        promotionEndsAt: data.promotion_ends_at ?? undefined,
                      };
                      onSubmit(mappedData, false);
                      resetForm();
                      ShowNotification({
                        message: `Categoría "${data.name}" creada con éxito`,
                        type: "success",
                      });
                    },
                    onError: (error: any) => {
                      ShowNotification({
                        message:
                          error?.message || "No se pudo crear la categoría",
                        type: "error",
                      });
                    },
                  });
                }}
              >
                Guardar y crear otra
              </Button>
            )}
          </Box>
        </Form>
      )}
    </Formik>
  );

  // return (
  //   <Box>
  //     <Box
  //       display="flex"
  //       alignItems="center"
  //       gap={2}
  //       mb={2}
  //       sx={{ borderBottom: 1, borderColor: "grey.800", pb: 4 }}
  //     >
  //       <TextField
  //         placeholder="Nombre de la categoría"
  //         name="newCategoryName"
  //         variant="outlined"
  //         fullWidth
  //         value={values.newCategoryName}
  //         onChange={(e) => setFieldValue("newCategoryName", e.target.value)}
  //       />
  //     </Box>
  //     {/* Sección para Iconos disponibles */}
  //     <Typography variant="subtitle2" mb={1} mt={5}>
  //       Iconos disponibles
  //     </Typography>
  //     <Box
  //       display="grid"
  //       gridTemplateColumns="repeat(auto-fill, minmax(85px, 1fr))"
  //       gap={2}
  //       mb={2}
  //       sx={{
  //         border: 1,
  //         borderColor: "grey.800",
  //         borderRadius: 1,
  //         padding: 4,
  //       }}
  //     >
  //       {/* Ejemplo de iconos dummy */}
  //       {iconKeys.map((key) => {
  //         const IconComponent = categoryIcons[key];
  //         const isSelected = values.newCategoryIcon === key;
  //         return (
  //           <Box
  //             key={key}
  //             sx={{
  //               width: 60,
  //               height: 60,
  //               // bgcolor: "grey.100",
  //               bgcolor: isSelected ? "grey.300" : "",
  //               borderRadius: 1,
  //               cursor: "pointer",
  //               display: "flex",
  //               justifyContent: "center",
  //               alignItems: "center",
  //             }}
  //             onClick={() => setFieldValue("newCategoryIcon", key)}
  //           >
  //             <IconComponent width="100%" height="100%" />
  //           </Box>
  //         );
  //       })}
  //     </Box>
  //     <Box display={"flex"} flexDirection={"column"} mt={5} gap={3}>
  //       <Button
  //         variant="contained"
  //         color="primary"
  //         fullWidth
  //         onClick={() => saveOrEditCategory(true)}
  //         disabled={!values.newCategoryName || !values.newCategoryIcon}
  //         sx={{
  //           boxShadow: 0,
  //         }}
  //       >
  //         Guardar
  //       </Button>
  //       {!values.editingCategoryId && (
  //         <Button
  //           fullWidth
  //           onClick={() => saveOrEditCategory(false)}
  //           variant="contained"
  //           color="secondary"
  //           disabled={!values.newCategoryName || !values.newCategoryIcon}
  //           sx={{
  //             // width: { xs: "100%", md: "auto" },
  //             // padding: "8px 12px 8px 12px",
  //             backgroundColor: "#EDEDED",
  //             color: "#4B4B4B",
  //             boxShadow: 0,
  //           }}
  //         >
  //           Guardar y crear nueva categoría
  //         </Button>
  //       )}
  //     </Box>
  //   </Box>
  // );
};
