import React from "react";
import {
  Alert,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Radio,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { FormikProps, Field } from "formik";
import Input from "../../../components/Input";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CustomRadioLabel from "../../../components/CustomRadioLabel";
import { sanitizeDiscountInput } from "../../../utils/promotionForm";

const HighlightSection: React.FC<FormikProps<any>> = ({
  values,
  setFieldValue,
  setValues,
  errors,
  touched,
}) => {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.100",
        borderRadius: 2,
        p: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <LocalOfferIcon />
        <Typography variant="h6" fontWeight="bold">
          Producto destacado
        </Typography>
      </Box>

      <Typography variant="subtitle1" mb={1} mt={2}>
        Stopper
      </Typography>
      <FormControlLabel
        control={
          <Switch
            name="stopper"
            checked={!!values.stopper}
            onChange={(e) =>
              setFieldValue("stopper", e.target.checked ? "FAVORITE" : "")
            }
          />
        }
        label="Activar Stopper"
      />
      <Typography variant="body1" color="textDisabled">
        Solo puede haber un producto "Favorito del mes" por categoría.
      </Typography>
      <Typography variant="body1" color="textDisabled">
        Solo puede haber un producto "Recomendado" por categoría.
      </Typography>

      {!!values.stopper && (
        <Box display="flex" flexDirection="column" ml={4} mt={2}>
          <FormControlLabel
            control={
              <Radio
                name="stopper"
                value="FAVORITE"
                checked={values.stopper === "FAVORITE"}
                onChange={() => setFieldValue("stopper", "FAVORITE")}
              />
            }
            label={<CustomRadioLabel label="Favorito del mes" />}
          />
          <FormControlLabel
            control={
              <Radio
                name="stopper"
                value="RECOMMENDED"
                checked={values.stopper === "RECOMMENDED"}
                onChange={() => setFieldValue("stopper", "RECOMMENDED")}
              />
            }
            label={
              <CustomRadioLabel
                label="Recomendado"
                backgroundColor="primary.main"
                fontColor="white"
              />
            }
          />
        </Box>
      )}

      <Typography variant="subtitle1" mt={3} mb={1}>
        Promoción
      </Typography>
      <FormControlLabel
        control={
          <Switch
            name="isPromotionActive"
            checked={values.isPromotionActive}
            onChange={(e) => {
              const checked = e.target.checked;
              // A single setValues call, not two setFieldValue calls: Formik
              // resolves each setFieldValue's validation against the
              // pre-update `state.values` snapshot plus only that one field,
              // so two calls in the same handler race — the second one's
              // validation run doesn't see the first one's change yet and
              // can overwrite it with stale results (e.g. still-false
              // isPromotionActive), silently invalidating the promo-type
              // required rule below.
              setValues((prev: any) => ({
                ...prev,
                isPromotionActive: checked,
                // Default to a valid promotion type as soon as the switch is
                // turned on, so an enabled promotion always has one selected
                // instead of requiring the user to notice and pick one.
                promotionOption:
                  checked && !prev.promotionOption
                    ? "descuento"
                    : prev.promotionOption,
              }));
            }}
          />
        }
        label="Activar producto en promoción"
      />
      {values.promotionStatus === "expired" && (
        <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
          Esta promoción ya finalizó.
        </Alert>
      )}
      {values.isPromotionActive && (
        <Box ml={4}>
          {errors.promotionOption && (
            <Typography variant="caption" color="error.main" display="block" mb={1}>
              {errors.promotionOption as string}
            </Typography>
          )}
          <Box display={"flex"} flexDirection={"column"}>
            <FormControlLabel
              control={
                <Radio
                  name="promotionOption"
                  value="descuento"
                  checked={values.promotionOption === "descuento"}
                  onChange={() =>
                    setValues((prev: any) => ({
                      ...prev,
                      promotionOption: "descuento",
                      multibuyOption: "",
                    }))
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
                sx={{
                  mb: 2,
                  ml: 8,
                  width: { xs: "100%", md: "50%" },
                }}
              />
            )}
          </Box>
          <Box display={"flex"} flexDirection={"column"}>
            <FormControlLabel
              control={
                <Radio
                  name="promotionOption"
                  value="oferta"
                  checked={values.promotionOption === "oferta"}
                  onChange={() =>
                    setValues((prev: any) => ({
                      ...prev,
                      promotionOption: "oferta",
                      discountPercentage: "",
                    }))
                  }
                />
              }
              label="Oferta"
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
                >
                  <MenuItem value="2x1">2x1</MenuItem>
                  <MenuItem value="3x2">3x2</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </Box>
      )}

      <Typography variant="subtitle1" mt={3} mb={1}>
        Tiempo limitado
      </Typography>
      <FormControlLabel
        control={
          <Switch
            name="countdownActive"
            checked={values.countdownActive}
            onChange={(e) => setFieldValue("countdownActive", e.target.checked)}
          />
        }
        label="Activar cuenta regresiva"
      />
      {values.countdownActive && (
        <Box
          display="flex"
          justifyContent={"space-between"}
          flexDirection={"column"}
          gap={2}
        >
          <Box display={"flex"} gap={2} flex={1}>
            <Field
              name="promotionStartDate"
              component={Input}
              label="Fecha Inicio"
              type="date"
              fullWidth
              value={values.promotionStartDate}
              onChange={(e: React.ChangeEvent<any>) => {
                setFieldValue("promotionStartDate", e.target.value);
              }}
              error={
                touched.promotionStartDate && Boolean(errors.promotionStartDate)
              }
              helperText={
                touched.promotionStartDate &&
                (errors.promotionStartDate as string)
              }
            />
            <Field
              name="promotionStartTime"
              component={Input}
              label="Hora inicio"
              type="time"
              fullWidth
              value={values.promotionStartTime}
              onChange={(e: React.ChangeEvent<any>) => {
                setFieldValue("promotionStartTime", e.target.value);
              }}
              error={
                touched.promotionStartTime && Boolean(errors.promotionStartTime)
              }
              helperText={
                touched.promotionStartTime &&
                (errors.promotionStartTime as string)
              }
            />
          </Box>
          <Box display={"flex"} gap={2} flex={1}>
            <Field
              name="promotionEndDate"
              component={Input}
              label="Fecha fin"
              type="date"
              fullWidth
              value={values.promotionEndDate}
              onChange={(e: React.ChangeEvent<any>) => {
                setFieldValue("promotionEndDate", e.target.value);
              }}
              error={
                touched.promotionEndDate && Boolean(errors.promotionEndDate)
              }
              helperText={
                touched.promotionEndDate && (errors.promotionEndDate as string)
              }
            />
            <Field
              name="promotionEndTime"
              component={Input}
              label="Hora Fin"
              type="time"
              fullWidth
              value={values.promotionEndTime}
              onChange={(e: React.ChangeEvent<any>) => {
                setFieldValue("promotionEndTime", e.target.value);
              }}
              error={
                touched.promotionEndTime && Boolean(errors.promotionEndTime)
              }
              helperText={
                touched.promotionEndTime && (errors.promotionEndTime as string)
              }
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HighlightSection;
