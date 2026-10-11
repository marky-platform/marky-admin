import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import "react-phone-input-2/lib/material.css"; // Customizable
import * as Yup from "yup";
import registerIllustration from "../assets/images/register-illustration.png";
import AuthAside from "../components/AuthAside";
import AuthLayout from "../components/AuthLayout";
import FormikPhoneInput from "../components/FormikPhoneInput";
import Input from "../components/Input";
import Link from "../components/Link";
import { ROUTES } from "../routes/paths";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { displayFormikFormErrors, ShowNotification } from "../utils/utils";

const AcceptTermsLabel = () => {
  return (
    <Typography component="span">
      Al crear una cuenta, aceptas nuestros{" "}
      <Link variant="accent">Términos del Servicio</Link> y nuestra{" "}
      <Link variant="accent">Políticas de Privacidad</Link>.
    </Typography>
  );
};

const Register: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isGoogleSignup = false;
  const [loading, setLoading] = useState(false);

  const initialValues = {
    businessName: "",
    email: "",
    phone: "",
    password: "",
  };

  const isRequiredMessage = "Este campo es requerido";
  const validationSchema = Yup.object().shape({
    businessName: Yup.string()
      .max(22, "No puede tener más de 22 caracteres")
      .required(isRequiredMessage),
    email: Yup.string().email("Email no válido").required(isRequiredMessage),
    phone: Yup.string().required(isRequiredMessage),
    password: Yup.string()
      .min(8, "Debe tener al menos 8 carácteres")
      .required(isRequiredMessage),
  });

  const handleSubmit = async (
    values: typeof initialValues,
    { setFieldError }: any
  ) => {
    setLoading(true);
    try {
      const response = await register({
        email: values.email,
        password: values.password,
        business_name: values.businessName.trim(),
        phone_number: values.phone,
      });
      ShowNotification({ message: response.message, type: "success" });
      setLoading(false);
      navigate(ROUTES.VERIFY_EMAIL, {
        state: {
          email: values.email,
        },
      });
    } catch (error: any) {
      console.error("Error en registro:", error);
      ShowNotification({ message: error.message, type: "error" });
      setLoading(false);
      displayFormikFormErrors(error, setFieldError);
    }
  };

  return (
    <AuthLayout
      aside={
        <AuthAside
          title="Tu negocio gastronómico,"
          highlight="listo para mostrarse."
          supportText="Organiza tus productos y crea un catálogo digital profesional para compartir con tus clientes."
          image={
            <Box
              component="img"
              src={registerIllustration}
              alt=""
              sx={{ width: "100%", maxWidth: 280 }}
            />
          }
        />
      }
      header={
        <>
          <Typography variant="body2">¿Ya tienes una cuenta?</Typography>
          <Link to={`${ROUTES.LOGIN}`} variant="accent">
            Inicia sesión
          </Link>
        </>
      }
    >
      <Typography
        sx={{
          width: "100%",
          textAlign: "left",
          marginBottom: theme.spacing(6),
        }}
        variant="h2"
      >
        {isGoogleSignup ? "Cuenta comercial" : "Crea tu cuenta en Marky"}
      </Typography>
      {/* {!isGoogleSignup ? (
        <Button
          variant="contained"
          sx={{
            backgroundColor: theme.palette.grey[400],
            color: theme.palette.text.primary,
            boxShadow: 0,
            marginBottom: theme.spacing(6),
          }}
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSuccess} // Fake Google Login success
        >
          Continuar con Google
        </Button>
      ) : (
        <Box
          sx={{
            marginBottom: theme.spacing(4),
            width: "100%",
          }}
        >
          <Input
            label="Correo electrónico"
            type="email"
            value={googleEmail}
            placeholder="nombre@correo.com"
            disabled
          />
        </Box>
      )} */}
      {/* {!isGoogleSignup && (
        <DividerWithText>
          <Typography variant="h5" color="textDisabled">
            O accede con tus datos
          </Typography>
        </DividerWithText>
      )} */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleSubmit,
          values,
          handleChange,
          setFieldValue,
          errors,
          touched,
          isValid,
          dirty,
        }) => (
          <Form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
            <Box sx={{ marginBottom: theme.spacing(6) }}>
              <Field
                name="businessName"
                component={Input}
                maxLength={22}
                label="Nombre del negocio"
                placeholder="Ej. Dulce Momento"
                type="text"
                required
                disabled={loading}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.businessName && errors.businessName}
                value={values.businessName}
                onChange={(e: React.ChangeEvent<any>) => {
                  setFieldValue("businessName", e.target.value);
                }}
              />
            </Box>
            {!isGoogleSignup && (
              <Box sx={{ marginBottom: theme.spacing(6) }}>
                <Field
                  name="email"
                  component={Input}
                  label="Correo electrónico"
                  type="email"
                  placeholder="nombre@correo.com"
                  required
                  disabled={loading}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  value={values.email}
                  onChange={(e: React.ChangeEvent<any>) => {
                    setFieldValue("email", e.target.value);
                  }}
                />
              </Box>
            )}
            <Box sx={{ marginBottom: theme.spacing(2) }}>
              <Field
                name="phone"
                required
                disabled={loading}
                component={FormikPhoneInput}
                label="Whatsapp"
                placeholder="981 123 456"
              />
            </Box>
            {!isGoogleSignup && (
              <Box sx={{ marginBottom: theme.spacing(6) }}>
                <Field
                  name="password"
                  component={Input}
                  label="Contraseña"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={loading}
                  error={touched.password && Boolean(errors.password)}
                  helperText={
                    touched.password && errors.password
                      ? errors.password
                      : "Su contraseña debe contar con un mínimo de 8 caracteres."
                  }
                  value={values.password}
                  onChange={(e: React.ChangeEvent<any>) => {
                    setFieldValue("password", e.target.value);
                  }}
                />
              </Box>
            )}
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginBottom: theme.spacing(6) }}
            >
              <AcceptTermsLabel />
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={!dirty || !isValid || loading}
              sx={{
                marginTop: theme.spacing(2),
                marginBottom: theme.spacing(6),
                fontWeight: 600,
                "&:not(.Mui-disabled):hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
                "&.Mui-disabled": {
                  backgroundColor: "surface.disabled",
                  color: "text.placeholder",
                  boxShadow: "none",
                  cursor: "not-allowed",
                  pointerEvents: "auto",
                },
              }}
            >
              Crear cuenta
            </Button>
          </Form>
        )}
      </Formik>
      <Box display={"flex"} gap={2} sx={{ display: { xs: "flex", md: "none" } }}>
        <Typography variant="body2">¿Ya formas parte?</Typography>
        <Link to={`${ROUTES.LOGIN}`} variant="accent">
          Inicia sesión ahora
        </Link>
      </Box>
    </AuthLayout>
  );
};

export default Register;
