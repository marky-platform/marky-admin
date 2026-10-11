import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Field, Form, Formik, useFormikContext } from "formik";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { ReactComponent as ExchangeIcon } from "../../assets/icons/exchange.svg";
import { ReactComponent as ParaguayFlagIcon } from "../../assets/icons/flag-paraguay.svg";
import { ReactComponent as VenezuelaFlagIcon } from "../../assets/icons/flag-venezuela.svg";
import { ReactComponent as LocationIcon } from "../../assets/icons/location-marker.svg";
import BusinessTypeSelectorField from "../../components/BusinessTypeSelectorField";
import CategorySelectionList from "../../components/CategorySelectionList";
import FormikPhoneInput from "../../components/FormikPhoneInput";
import { Header } from "../../components/Header";
import Input from "../../components/Input";
import CustomModal from "../../components/Modal";
import NumberInput from "../../components/NumberInput";
import { useBusinessAccountInfo } from "../../hooks/useBusinessAccountInfo";
import { useUpdateBusinessAccountInfo } from "../../hooks/useBusinessMutations";
import { useCategories } from "../../hooks/useCategories";
import { useCities } from "../../hooks/useCities";
import { useCountries } from "../../hooks/useCountries";
import { useCurrencies } from "../../hooks/useCurrencies";
import { useHomePageData } from "../../hooks/useHomePageData";
import BusinessAvatar from "../home/components/BusinessAvatar";
import { BUSINESS_CATEGORY_ICON_MAP } from "../../utils/businessCategoryIcons";
import { displayFormikFormErrors } from "../../utils/utils";

const SettingsCard: React.FC<{
  title: string;
  onEdit?: () => void;
  children?: React.ReactNode;
  paperSx?: object;
}> = ({ title, onEdit, children, paperSx }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "12px",
        pt: 4,
        pb: 6,
        px: 6,
        mb: "25px",
        bgcolor: "surface.main",
        border: (theme) => `1px solid ${theme.palette.border.divider}`,
        ...paperSx,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">{title}</Typography>
        {onEdit && (
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{ bgcolor: "surface.iconButton", borderRadius: "6px", p: 2 }}
          >
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
      <Box mt={2}>{children}</Box>
    </Paper>
  );
};

const FieldDisplay: React.FC<{
  label: string;
  value?: React.ReactNode;
  sx?: object;
}> = ({ label, value, sx }) => (
  <Box sx={sx}>
    <Typography
      sx={{ fontSize: 14, fontWeight: 700, color: "text.title", mb: 0.5 }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        backgroundColor: "surface.field",
        borderRadius: "6px",
        py: 1.5,
        px: 3,
        minHeight: 48,
        display: "flex",
        alignItems: "center",
      }}
    >
      {value ?? "-"}
    </Box>
  </Box>
);

type LocationFormValues = {
  country: string;
  city: string;
};

const LocationFormFields: React.FC<{
  countries?: any[];
  currentCityLabel: string;
  onCancel: () => void;
}> = ({ countries, currentCityLabel, onCancel }) => {
  const { values, setFieldValue, isSubmitting } =
    useFormikContext<LocationFormValues>();
  const { cities, isLoading: isLoadingCities } = useCities(
    values.country || null,
  );

  const hasSelectedCityInOptions = (cities || []).some(
    (c: any) => String(c.id) === String(values.city),
  );

  return (
    <Form>
      <TextField
        select
        fullWidth
        label="País"
        value={values.country}
        onChange={(e) => {
          const nextCountryId = e.target.value;
          if (nextCountryId === values.country) return;
          setFieldValue("country", nextCountryId);
          setFieldValue("city", "");
        }}
        margin="normal"
        sx={(theme) => ({
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.grey[100],
          },
        })}
      >
        {(countries || []).map((c: any) => (
          <MenuItem key={c.id} value={String(c.id)}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        label="Ciudad"
        value={values.city}
        onChange={(e) => setFieldValue("city", e.target.value)}
        margin="normal"
        disabled={!values.country || isLoadingCities}
        sx={(theme) => ({
          "& .MuiOutlinedInput-root": {
            backgroundColor: theme.palette.grey[100],
          },
        })}
      >
        {isLoadingCities && values.country ? (
          <MenuItem value="">Cargando ciudades...</MenuItem>
        ) : (
          (cities || []).map((c: any) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))
        )}

        {!isLoadingCities &&
          values.city &&
          !hasSelectedCityInOptions &&
          currentCityLabel && (
            <MenuItem value={values.city}>{currentCityLabel}</MenuItem>
          )}
      </TextField>

      <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ paddingX: 4 }}
        >
          Guardar
        </Button>
      </Box>
    </Form>
  );
};

const sidebarNavItemSx = {
  borderRadius: "6px",
  mb: 1,
  "&.Mui-selected": {
    backgroundColor: "surface.subtle",
    "&:hover": { backgroundColor: "surface.subtle" },
  },
};

const CountryFlag: React.FC<{ countryName?: string }> = ({ countryName }) => {
  if (countryName === "Paraguay") return <ParaguayFlagIcon width={24} height={18} />;
  if (countryName === "Venezuela") return <VenezuelaFlagIcon width={24} height={18} />;
  return null;
};

const AccountConfigurationPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedSection, setSelectedSection] = useState<
    "configuration" | "security"
  >("configuration");

  const { data, isLoading } = useBusinessAccountInfo();
  const { data: homePageData } = useHomePageData();
  const updateAccountInfo = useUpdateBusinessAccountInfo();

  const { categories: allCategories } = useCategories();
  const { countries } = useCountries();
  const { currencies } = useCurrencies();

  const [openModal, setOpenModal] = useState<
    null | "categories" | "location" | "business_type" | "money" | "access"
  >(null);
  const exchangeFromCode = data?.is_primary_to_secondary
    ? data?.primary_currency_code
    : data?.secondary_currency_code;
  const exchangeToCode = data?.is_primary_to_secondary
    ? data?.secondary_currency_code
    : data?.primary_currency_code;

  return (
    <Box>
      <Header />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          px: { xs: 4, md: "38px" },
          pt: "18px",
          pb: "12px",
          borderBottom: (theme) => `1px solid ${theme.palette.border.divider}`,
          bgcolor: "surface.base",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          aria-label="Volver"
          sx={{ bgcolor: "surface.iconButton", borderRadius: "6px", p: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: isMobile ? 16 : 24,
            color: "text.heading",
          }}
        >
          Mi cuenta
        </Typography>
      </Box>

      {isMobile && (
        <Box sx={{ display: "flex", bgcolor: "surface.base" }}>
          {(
            [
              { key: "configuration", label: "Configuración" },
              { key: "security", label: "Seguridad" },
            ] as const
          ).map(({ key, label }) => {
            const active = selectedSection === key;
            return (
              <Box
                key={key}
                onClick={() => setSelectedSection(key)}
                sx={{
                  flex: 1,
                  textAlign: "center",
                  py: 3.25,
                  cursor: "pointer",
                  borderBottom: (theme) =>
                    active
                      ? `2px solid ${theme.palette.primary.main}`
                      : `1px solid ${theme.palette.border.light}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    color: active ? "primary.main" : "text.disabled",
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {!isMobile && (
          <Box
            sx={{
              width: 280,
              p: 4,
              borderRight: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Typography
              sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", mb: 1 }}
            >
              Tu cuenta
            </Typography>
            <List>
              <ListItemButton
                selected={selectedSection === "configuration"}
                onClick={() => setSelectedSection("configuration")}
                sx={sidebarNavItemSx}
              >
                <ListItemIcon>
                  <SettingsOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Configuración" />
              </ListItemButton>
              <ListItemButton
                selected={selectedSection === "security"}
                onClick={() => setSelectedSection("security")}
                sx={sidebarNavItemSx}
              >
                <ListItemIcon>
                  <LockOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Seguridad" />
              </ListItemButton>
            </List>
          </Box>
        )}

        <Box sx={{ flex: 1, p: { xs: 2, md: 6 } }}>
          {isLoading ? (
            <Typography>Cargando...</Typography>
          ) : selectedSection === "configuration" ? (
            <Box
              display="flex"
              gap="38px"
              flexWrap="wrap"
              justifyContent={isMobile ? "center" : "flex-start"}
            >
              <Box flex="1 1 0" minWidth={300} maxWidth={1024}>
                {/* Categoría comercial */}
                <SettingsCard
                  title="Categoría comercial"
                  onEdit={() => setOpenModal("categories")}
                >
                  {(data?.categories ?? []).length ? (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {data!.categories.map((c) => {
                        const Icon = BUSINESS_CATEGORY_ICON_MAP[c.name];
                        return (
                          <Box
                            key={c.id}
                            sx={{
                              bgcolor: "secondary.main",
                              color: "accent.link",
                              fontSize: 14,
                              px: 2,
                              py: 1,
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {Icon && <Icon width={20} height={20} />}
                            {c.name}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        bgcolor: "secondary.main",
                        color: "accent.link",
                        fontSize: 14,
                        px: 2,
                        py: 1,
                        borderRadius: "6px",
                        display: "inline-block",
                      }}
                    >
                      Sin categoría
                    </Box>
                  )}
                </SettingsCard>

                {/* Ubicación */}
                <SettingsCard
                  title="Ubicación geográfica"
                  onEdit={() => setOpenModal("location")}
                >
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", md: "row" }}
                  >
                    <Box flex={1}>
                      <FieldDisplay
                        label="País"
                        value={
                          data?.country_name ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <CountryFlag countryName={data.country_name} />
                              <Typography
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "text.primary",
                                }}
                              >
                                {data.country_name}
                              </Typography>
                            </Box>
                          ) : undefined
                        }
                      />
                    </Box>
                    <Box flex={1}>
                      <FieldDisplay label="Ciudad" value={data?.city_name} />
                    </Box>
                  </Box>
                </SettingsCard>

                {/* Tipo de negocio */}
                <SettingsCard
                  title="Tipo de negocio"
                  onEdit={() => setOpenModal("business_type")}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationIcon width={24} height={24} />
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "accent.link",
                          fontSize: 14,
                        }}
                      >
                        {data?.business_type === "commercial"
                          ? "Comercial"
                          : data?.business_type === "entrepreneur"
                            ? "Emprendedor"
                            : data?.business_type || "Sin definir"}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "text.strong" }}>
                        {data?.business_type === "commercial"
                          ? "Tu negocio dispone de sucursal para recibir clientes o comensales"
                          : data?.business_type === "entrepreneur"
                            ? "Tu negocio aun no cuenta con sucursal. Opera desde un centro de producción."
                            : ""}
                      </Typography>
                    </Box>
                  </Box>
                </SettingsCard>

                {/* Expresión monetaria */}
                <SettingsCard
                  title="Expresión monetaria"
                  onEdit={() => setOpenModal("money")}
                >
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{ xs: "column", md: "row" }}
                  >
                    <Box flex={1}>
                      <FieldDisplay
                        label="Moneda de uso"
                        value={
                          data?.primary_currency_code
                            ? `${data.primary_currency_code} - ${data.primary_currency_name}`
                            : undefined
                        }
                      />
                    </Box>
                    <Box flex={1}>
                      <FieldDisplay
                        label="Moneda Secundaria"
                        value={
                          data?.secondary_currency_code
                            ? `${data.secondary_currency_code} - ${data.secondary_currency_name}`
                            : undefined
                        }
                      />
                    </Box>
                  </Box>
                  <Box mt={2}>
                    <Typography variant="body2">
                      Precios con tasa de cambio
                    </Typography>
                    <Typography variant="caption">
                      Se mostrará el valor de cambio en tus productos.
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mt={2}>
                      <Box
                        sx={{
                          backgroundColor: "surface.warning",
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                        }}
                      >{`1 ${exchangeFromCode ?? ""}`}</Box>
                      <Box>es igual a:</Box>
                      <Box
                        sx={{
                          backgroundColor: "surface.warning",
                          px: 2,
                          py: 1,
                          borderRadius: 1,
                        }}
                      >{`${data?.exchange_rate} ${exchangeToCode ?? ""}`}</Box>
                      <IconButton
                        sx={{ bgcolor: "surface.iconButton", borderRadius: "6px", p: 2 }}
                      >
                        <ExchangeIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </SettingsCard>
              </Box>

              {!isMobile && (
                <Box width={330} flexShrink={0}>
                  <Typography
                    sx={{ fontSize: 18, fontWeight: 500, color: "text.strong", mb: 3 }}
                  >
                    Previsualización
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      border: (theme) => `1px solid ${theme.palette.border.header}`,
                      borderRadius: "12px",
                      py: 6,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <BusinessAvatar
                      photo={homePageData?.profile_image}
                      size={110}
                      sx={{ mb: 3 }}
                    />
                    <Typography
                      sx={{ fontSize: 18, fontWeight: 500, color: "text.primary" }}
                    >
                      {data?.business_name ?? "Nombre del comercio"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 14, color: "text.body", mt: 1 }}
                    >
                      {(data?.categories ?? []).map((c) => c.name).join(", ") ||
                        "Sin categoría"}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <StorefrontOutlinedIcon
                        sx={{ fontSize: 14, color: "primary.main" }}
                      />
                      <Typography sx={{ fontSize: 12, color: "primary.main" }}>
                        Negocio
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          ) : (
            // Security section
            <Box>
              <SettingsCard
                title="Datos de acceso"
                onEdit={() => setOpenModal("access")}
              >
                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", md: "row" }}
                >
                  <Box flex={1}>
                    <FieldDisplay label="Email" value={data?.email} />
                  </Box>
                  <Box flex={1}>
                    <FieldDisplay
                      label="Whatsapp o teléfono"
                      value={data?.phone_number}
                    />
                  </Box>
                </Box>
              </SettingsCard>

              <SettingsCard title="Contraseña">
                <Typography sx={{ fontSize: 14, color: "text.body", mb: 1 }}>
                  Cambia tu contraseña en cualquier momento.
                </Typography>
                {/* No hay endpoint de cambio de contraseña autenticado todavía
                    (authService.changePassword solo funciona con el link
                    público de recuperación por email) — habilitar cuando el
                    backend lo exponga. */}
                <Typography
                  component="span"
                  sx={{ fontSize: 14, fontWeight: 500, color: "accent.link" }}
                >
                  Cambiar contraseña
                </Typography>
              </SettingsCard>
            </Box>
          )}
        </Box>
      </Box>

      {/* MODALS */}
      <CustomModal
        open={openModal === "access"}
        onClose={() => setOpenModal(null)}
        title="Editar datos de acceso"
        sx={{ width: 520 }}
        hideFooter
      >
        <Formik
          enableReinitialize
          initialValues={{
            email: data?.email ?? "",
            phone_number: data?.phone_number ?? "",
          }}
          validationSchema={Yup.object({
            email: Yup.string().email("Email inválido").required("Requerido"),
          })}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              setSubmitting(true);
              await updateAccountInfo.mutateAsync({
                email: values.email,
                phone_number: values.phone_number,
              });
              setOpenModal(null);
            } catch (err: any) {
              displayFormikFormErrors(err, setFieldError);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="email" component={Input} label="Email" />
              <Field
                name="phone_number"
                component={FormikPhoneInput}
                label="Whatsapp o teléfono"
              />
              <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={() => setOpenModal(null)}>Cancelar</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ paddingX: 4 }}
                >
                  Guardar
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </CustomModal>

      <CustomModal
        open={openModal === "categories"}
        onClose={() => setOpenModal(null)}
        title="Editar categorías"
        sx={{ width: 720 }}
        hideFooter
      >
        <Formik
          enableReinitialize
          initialValues={{ categories: data?.categories ?? [] }}
          validationSchema={Yup.object({
            categories: Yup.array().min(1, "Selecciona al menos una categoría"),
          })}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              setSubmitting(true);
              const ids = values.categories.map((c: any) => Number(c.id));
              await updateAccountInfo.mutateAsync({ categories: ids });
              setOpenModal(null);
            } catch (err: any) {
              displayFormikFormErrors(err, setFieldError);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            // Wrapper compatible con el uso interno de CategorySelectionList.
            // CategorySelectionList puede llamar a `setSelected` con
            // - un array (nuevo valor), o
            // - una función (prev => next) como hace un setter de useState.
            // Al usar Formik debemos soportar ambos casos y resolver la función
            // aplicándola al valor actual antes de guardar en Formik.
            const handleSelectedChange = (next: any) => {
              const current = values.categories || [];
              const nextValue =
                typeof next === "function" ? next(current) : next;
              setFieldValue("categories", nextValue);
            };

            return (
              <Form>
                <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
                  {/* @ts-ignore */}
                  <CategorySelectionList
                    categories={allCategories || []}
                    maxSelectable={3}
                    selected={values.categories || []}
                    setSelected={handleSelectedChange}
                    renderIcon={(cat) => {
                      const Icon = BUSINESS_CATEGORY_ICON_MAP[cat.name];
                      return Icon ? <Icon width={30} height={30} /> : null;
                    }}
                  />
                </Box>
                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                  <Button onClick={() => setOpenModal(null)}>Cancelar</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ paddingX: 4 }}
                  >
                    Guardar
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CustomModal>

      <CustomModal
        open={openModal === "location"}
        onClose={() => setOpenModal(null)}
        title="Editar ubicación"
        sx={{ width: 520 }}
        hideFooter
      >
        {!data ? (
          <Box p={4}>
            <Typography>Cargando...</Typography>
          </Box>
        ) : (
          <Formik
            enableReinitialize
            initialValues={{
              country: data?.country_id ? String(data.country_id) : "",
              city: data?.city_id ? String(data.city_id) : "",
            }}
            validationSchema={Yup.object({
              city: Yup.string().required("Selecciona una ciudad"),
            })}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                setSubmitting(true);
                const cityId = values.city ? Number(values.city) : undefined;
                if (cityId) {
                  await updateAccountInfo.mutateAsync({ city: cityId });
                }
                setOpenModal(null);
              } catch (err: any) {
                displayFormikFormErrors(err, setFieldError);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {() => (
              <LocationFormFields
                countries={countries}
                currentCityLabel={data?.city_name ?? ""}
                onCancel={() => setOpenModal(null)}
              />
            )}
          </Formik>
        )}
      </CustomModal>

      <CustomModal
        open={openModal === "business_type"}
        onClose={() => setOpenModal(null)}
        title="Tipo de negocio"
        sx={{ width: 520 }}
        hideFooter
      >
        <Formik
          enableReinitialize
          initialValues={{ business_type: data?.business_type ?? "" }}
          validationSchema={Yup.object({
            business_type: Yup.string().required("Requerido"),
          })}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              setSubmitting(true);
              await updateAccountInfo.mutateAsync({
                business_type: values.business_type,
              });
              setOpenModal(null);
            } catch (err: any) {
              displayFormikFormErrors(err, setFieldError);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field
                name="business_type"
                component={BusinessTypeSelectorField}
                options={[
                  {
                    value: "commercial",
                    label: "Comercial",
                    description:
                      "Tu negocio dispone de sucursal para recibir clientes o comensales",
                  },
                  {
                    value: "entrepreneur",
                    label: "Emprendedor",
                    description:
                      "Tu negocio aun no cuenta con sucursal. Opera desde un centro de producción.",
                  },
                ]}
              />
              <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={() => setOpenModal(null)}>Cancelar</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ paddingX: 4 }}
                >
                  Guardar
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </CustomModal>

      <CustomModal
        open={openModal === "money"}
        onClose={() => setOpenModal(null)}
        title="Expresión monetaria"
        sx={{ width: 720 }}
        hideFooter
      >
        <Formik
          enableReinitialize
          initialValues={{
            primary_currency: data?.primary_currency_id ?? "",
            secondary_currency: data?.secondary_currency_id ?? "",
            exchange_rate: data?.exchange_rate ?? "",
            is_primary_to_secondary: data?.is_primary_to_secondary ?? true,
            enable_exchange_rate: Boolean(data?.secondary_currency_id),
          }}
          validationSchema={Yup.object({
            primary_currency: Yup.string().required("Requerido"),
          })}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            try {
              setSubmitting(true);
              const payload: any = {
                primary_currency: values.primary_currency
                  ? Number(values.primary_currency)
                  : undefined,
                is_primary_to_secondary: values.is_primary_to_secondary,
              };
              if (values.enable_exchange_rate) {
                payload.secondary_currency = values.secondary_currency
                  ? Number(values.secondary_currency)
                  : null;
                payload.exchange_rate = values.exchange_rate || null;
              } else {
                payload.secondary_currency = null;
                payload.exchange_rate = null;
              }
              await updateAccountInfo.mutateAsync(payload);
              setOpenModal(null);
            } catch (err: any) {
              displayFormikFormErrors(err, setFieldError);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            const primaryCurrencyObj = (currencies || []).find(
              (c: any) => String(c.id) === String(values.primary_currency),
            );
            const secondaryCurrencyObj = (currencies || []).find(
              (c: any) => String(c.id) === String(values.secondary_currency),
            );

            const fromCode = values.is_primary_to_secondary
              ? primaryCurrencyObj?.code
              : secondaryCurrencyObj?.code;
            const toCode = values.is_primary_to_secondary
              ? secondaryCurrencyObj?.code
              : primaryCurrencyObj?.code;

            return (
              <Form>
                <TextField
                  select
                  fullWidth
                  label="Moneda principal"
                  value={values.primary_currency}
                  onChange={(e) => {
                    const next = e.target.value;
                    // if secondary equals new primary, clear secondary and rate
                    if (String(values.secondary_currency) === String(next)) {
                      setFieldValue("secondary_currency", "");
                      setFieldValue("exchange_rate", "");
                    }
                    setFieldValue("primary_currency", next);
                  }}
                  margin="normal"
                  sx={(t) => ({
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: t.palette.grey[100],
                    },
                  })}
                >
                  {(currencies || []).map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </MenuItem>
                  ))}
                </TextField>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.enable_exchange_rate}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFieldValue("enable_exchange_rate", checked);
                        if (!checked) {
                          setFieldValue("secondary_currency", "");
                          setFieldValue("exchange_rate", "");
                        }
                      }}
                    />
                  }
                  label="Precios con tasa de cambio"
                />
                {values.enable_exchange_rate && (
                  <>
                    <TextField
                      select
                      fullWidth
                      label="Moneda secundaria"
                      value={values.secondary_currency}
                      onChange={(e) =>
                        setFieldValue("secondary_currency", e.target.value)
                      }
                      margin="normal"
                      sx={(t) => ({
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: t.palette.grey[100],
                        },
                      })}
                    >
                      {(currencies || [])
                        .filter(
                          (curr: any) =>
                            String(curr.id) !== String(values.primary_currency),
                        )
                        .map((c: any) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.code} - {c.name}
                          </MenuItem>
                        ))}
                    </TextField>

                    {values.secondary_currency && (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                          }}
                        >
                          <Box
                            sx={(t) => ({
                              width: "fit-content",
                              whiteSpace: "nowrap",
                              backgroundColor: t.palette.grey[300],
                              paddingX: 2,
                              paddingY: 1,
                              borderRadius: 2,
                              textAlign: "center",
                            })}
                          >
                            <Typography id="modal-description" variant="body2">
                              {fromCode ? `1 ${fromCode}` : ""}
                            </Typography>
                          </Box>

                          <Box
                            sx={{ width: "fit-content", whiteSpace: "nowrap" }}
                          >
                            <Typography id="modal-description" variant="body2">
                              es igual a:
                            </Typography>
                          </Box>

                          <Field
                            component={NumberInput}
                            name="exchange_rate"
                            label="Tasa de cambio"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography variant="body2">
                                    {toCode ?? ""}
                                  </Typography>
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Button
                            variant="outlined"
                            sx={{
                              border: 0,
                              backgroundColor: theme.palette.grey[300],
                              mt: 4,
                            }}
                            onClick={() => {
                              setFieldValue(
                                "is_primary_to_secondary",
                                !values.is_primary_to_secondary,
                              );
                              setFieldValue("exchange_rate", "");
                            }}
                          >
                            <ExchangeIcon />
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </>
                )}
                <Box
                  mt={4}
                  display="flex"
                  justifyContent="flex-end"
                  gap={2}
                  pt={4}
                >
                  <Button onClick={() => setOpenModal(null)}>Cancelar</Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{ paddingX: 4 }}
                  >
                    Guardar
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </CustomModal>
    </Box>
  );
};

export default AccountConfigurationPage;
