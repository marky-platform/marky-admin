import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Form, Formik, FormikProps, getIn } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import BackButton from "../../../../components/BackButton";
import CancelButton from "../../../../components/CancelButton";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import XButton from "../../../../components/XButton";
import InsetSurface from "../../../../themes/InsetSurface";
import { useBusinessAccountInfo } from "../../../../hooks/useBusinessAccountInfo";
import { useUpdateSocialMediaLinks } from "../../../../hooks/useUpdateSocialMediaLinks";
import { mapChannelsToPayload } from "../../../../mappers/channelMapper";
import { isValidWebsiteUrl } from "../../../../utils/websiteUrl";
import {
  ChannelEntry,
  ChannelKey,
  ChannelsByKey,
} from "../../../../types/channel";
import {
  ALL_CHANNEL_KEYS,
  CHANNEL_META,
  MAX_SELECTED_CHANNELS,
} from "./channels.constants";
import ChannelWelcomeStep from "./ChannelWelcomeStep";
import ChannelSelectStep from "./ChannelSelectStep";
import ChannelSummaryStep from "./ChannelSummaryStep";
import ChannelDetailStep from "./ChannelDetailStep";

export interface ChannelsFormValues {
  channels: Record<ChannelKey, ChannelEntry[]>;
}

interface ChannelWizardModalProps {
  open: boolean;
  onBack?: () => void;
  onClose: () => void;
  /** Canales ya configurados, en el formato que produce mapSocialLinksToChannels */
  initialData?: ChannelsByKey;
  onSubmit?: (channels: ChannelsByKey) => void;
}

type WizardStep = "welcome" | "select" | "summary" | "detail";

const emptyChannels = (): Record<ChannelKey, ChannelEntry[]> => {
  const channels = {} as Record<ChannelKey, ChannelEntry[]>;
  ALL_CHANNEL_KEYS.forEach((key) => {
    channels[key] = [];
  });
  return channels;
};

const phoneSchema = Yup.string()
  .required("El campo WhatsApp es obligatorio")
  .test(
    "is-py-or-ve",
    "Debe ser un número válido de Paraguay (+5959XXXXXXXX) o Venezuela (+58XXXXXXXXXX)",
    (value = "") => {
      const digits = value.replace(/\D/g, "");
      // Paraguay: +595 9XX XXX XXX → "5959" + 8 dígitos → total 12 dígitos
      if (/^5959\d{8}$/.test(digits)) return true;
      // Venezuela: +58 + 10 dígitos (p.ej. móvil 412 xxx xxxx)
      if (/^58\d{10}$/.test(digits)) return true;
      return false;
    },
  );

const urlSchema = Yup.string()
  .required("El campo es obligatorio")
  .test(
    "is-valid-website",
    "Ingresa un sitio web válido. Ejemplo: www.sitio.com",
    isValidWebsiteUrl,
  );

const usernameSchema = Yup.string()
  .required("El campo es obligatorio")
  .matches(/^[^\s/]+$/, 'Ingresa solo tu usuario, sin espacios ni "/"');

const urlSchemaByChannel: Record<ChannelKey, Yup.StringSchema> = {
  instagram: usernameSchema,
  facebook: usernameSchema,
  tiktok: usernameSchema,
  whatsapp: phoneSchema,
  link: urlSchema,
};

const buildValidationSchema = (selectedChannels: ChannelKey[]) => {
  const shape: Record<string, any> = {};

  ALL_CHANNEL_KEYS.forEach((key) => {
    const meta = CHANNEL_META[key];
    const entrySchema = Yup.object({
      label: meta.multiEntry
        ? Yup.string().required("El nombre es obligatorio").max(22)
        : Yup.string(),
      url: urlSchemaByChannel[key],
    });

    let arraySchema: any = Yup.array().of(entrySchema);
    if (selectedChannels.includes(key)) {
      arraySchema = arraySchema
        .min(1)
        .max(meta.maxEntries)
        .test("no-duplicates", "Hay una entrada duplicada", (entries: any) => {
          if (!entries) return true;
          const urls = entries
            .map((entry: any) => (entry?.url || "").trim().toLowerCase())
            .filter(Boolean);
          return urls.length === new Set(urls).size;
        });
    }
    shape[key] = arraySchema;
  });

  return Yup.object({ channels: Yup.object(shape) });
};

export const ChannelWizardModal: React.FC<ChannelWizardModalProps> = ({
  open,
  onBack,
  onClose,
  initialData = {},
  onSubmit = () => {},
}) => {
  // Número actual de la cuenta (no el de sesión, que puede quedar
  // desactualizado tras editarlo en Configuración de cuenta), para
  // precargar WhatsApp al seleccionarlo por primera vez.
  const { data: accountInfo } = useBusinessAccountInfo();
  const currentPhone = accountInfo?.phone_number;

  const updateSocialMediaMutation = useUpdateSocialMediaLinks();

  const initiallySelected = useMemo(
    () => ALL_CHANNEL_KEYS.filter((key) => (initialData[key]?.length ?? 0) > 0),
    [initialData],
  );

  const [step, setStep] = useState<WizardStep>(
    initiallySelected.length > 0 ? "summary" : "welcome",
  );
  const [detailChannel, setDetailChannel] = useState<ChannelKey | null>(null);
  const [selectedChannels, setSelectedChannels] =
    useState<ChannelKey[]>(initiallySelected);

  // Si llegan datos ya configurados (o cambian, p.ej. tras un round-trip al
  // backend), saltar directo al hub, igual que el comportamiento actual.
  useEffect(() => {
    if (initiallySelected.length > 0) {
      setSelectedChannels(initiallySelected);
      setStep("summary");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const initialValues: ChannelsFormValues = useMemo(() => {
    const channels = emptyChannels();
    ALL_CHANNEL_KEYS.forEach((key) => {
      const entries = initialData[key];
      if (entries && entries.length > 0) {
        channels[key] = entries.map((entry) => ({ ...entry }));
      }
    });
    return { channels };
  }, [initialData]);

  const validationSchema = useMemo(
    () => buildValidationSchema(selectedChannels),
    [selectedChannels],
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        const payload = mapChannelsToPayload(values.channels);
        updateSocialMediaMutation.mutate(payload, {
          onSuccess: () => {
            onSubmit(values.channels);
            onClose();
          },
        });
      }}
      validateOnMount
      enableReinitialize
    >
      {(formik) => (
        <ChannelWizardModalContent
          formik={formik}
          open={open}
          onBack={onBack}
          onClose={onClose}
          currentPhone={currentPhone}
          updateSocialMediaPending={updateSocialMediaMutation.isPending}
          step={step}
          setStep={setStep}
          detailChannel={detailChannel}
          setDetailChannel={setDetailChannel}
          selectedChannels={selectedChannels}
          setSelectedChannels={setSelectedChannels}
        />
      )}
    </Formik>
  );
};

interface ChannelWizardModalContentProps {
  formik: FormikProps<ChannelsFormValues>;
  open: boolean;
  onBack?: () => void;
  onClose: () => void;
  currentPhone?: string;
  updateSocialMediaPending: boolean;
  step: WizardStep;
  setStep: (step: WizardStep) => void;
  detailChannel: ChannelKey | null;
  setDetailChannel: (channel: ChannelKey | null) => void;
  selectedChannels: ChannelKey[];
  setSelectedChannels: React.Dispatch<React.SetStateAction<ChannelKey[]>>;
}

const ChannelWizardModalContent: React.FC<ChannelWizardModalContentProps> = ({
  formik,
  open,
  onBack,
  onClose,
  currentPhone,
  updateSocialMediaPending,
  step,
  setStep,
  detailChannel,
  setDetailChannel,
  selectedChannels,
  setSelectedChannels,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [unsavedConfirmOpen, setUnsavedConfirmOpen] = useState(false);

  const {
    values,
    dirty,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    validateForm,
    submitForm,
  } = formik;

  // Cerrar (X, Cancelar, click fuera o Esc) con cambios sin llevar a
  // "Finalizar" perdería silenciosamente esos cambios (p.ej. un canal
  // eliminado en el detalle solo se persiste al finalizar el wizard), así
  // que se avisa antes de descartarlos.
  const requestClose = () => {
    if (dirty) {
      setUnsavedConfirmOpen(true);
      return;
    }
    onClose();
  };

  // Si WhatsApp ya está seleccionado pero su número sigue vacío (p.ej. se
  // seleccionó antes de que resolviera la consulta de cuenta), lo completa
  // en cuanto el número esté disponible, sin pisar lo que el usuario ya
  // haya escrito.
  useEffect(() => {
    if (!currentPhone) return;
    if (!selectedChannels.includes("whatsapp")) return;
    const entries = values.channels.whatsapp;
    if (entries.length > 0 && !entries[0].url) {
      setFieldValue("channels.whatsapp[0].url", currentPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPhone, selectedChannels]);

  const toggleChannel = (key: ChannelKey) => {
    const isSelected = selectedChannels.includes(key);
    if (isSelected) {
      setSelectedChannels((prev) => prev.filter((k) => k !== key));
      setFieldValue(`channels.${key}`, []);
      return;
    }
    if (selectedChannels.length >= MAX_SELECTED_CHANNELS) return;
    setSelectedChannels((prev) => [...prev, key]);
    const existing = values.channels[key];
    if (!existing || existing.length === 0) {
      setFieldValue(`channels.${key}`, [
        { label: "", url: key === "whatsapp" ? currentPhone || "" : "" },
      ]);
    }
  };

  const openDetail = (key: ChannelKey) => {
    setDetailChannel(key);
    setStep("detail");
  };

  const handleSaveDetail = async () => {
    if (!detailChannel) return;
    const meta = CHANNEL_META[detailChannel];
    const entries = values.channels[detailChannel] || [];
    entries.forEach((_, index) => {
      setFieldTouched(`channels.${detailChannel}[${index}].url`, true, false);
      if (meta.multiEntry) {
        setFieldTouched(
          `channels.${detailChannel}[${index}].label`,
          true,
          false,
        );
      }
    });
    const validationErrors = await validateForm();
    const channelErrors = getIn(validationErrors, `channels.${detailChannel}`);
    if (!channelErrors) {
      setStep("summary");
    }
  };

  const titles: Record<WizardStep, string> = {
    welcome: "Administrar canales",
    select: "Canales",
    summary: "Canales",
    detail: detailChannel ? CHANNEL_META[detailChannel].detailTitle : "",
  };

  const showHeaderBack = step === "detail" ? true : Boolean(onBack);
  const handleHeaderBack = () => {
    if (step === "detail") {
      setStep("summary");
      return;
    }
    onBack?.();
  };

  return (
    <Form>
      <Dialog
        open={open}
        onClose={requestClose}
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
            flexShrink: 0,
          }}
        >
          <Box display={"flex"}>
            {showHeaderBack && (
              <Box display={"flex"} sx={{ paddingY: 3 }}>
                <BackButton onClick={handleHeaderBack} sx={{ marginLeft: 2 }} />
              </Box>
            )}
            <DialogTitle>{titles[step]}</DialogTitle>
          </Box>
          <Box display={"flex"} sx={{ paddingY: 3 }}>
            <XButton
              aria-label="Cerrar"
              onClick={requestClose}
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

        <DialogContent
          sx={
            isMobile
              ? {
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }
              : undefined
          }
        >
          {step === "welcome" && (
            <ChannelWelcomeStep onStart={() => setStep("select")} />
          )}
          {step === "select" && (
            <ChannelSelectStep
              selectedChannels={selectedChannels}
              onToggle={toggleChannel}
            />
          )}
          {step === "summary" && (
            <ChannelSummaryStep
              selectedChannels={selectedChannels}
              onOpenDetail={openDetail}
            />
          )}
          {step === "detail" && detailChannel && (
            <ChannelDetailStep channel={detailChannel} />
          )}
        </DialogContent>

        {step !== "welcome" && (
          <DialogActions
            disableSpacing={isMobile && step === "summary"}
            sx={{
              px: 3,
              py: 4,
              borderTop: (theme) => `1px solid ${theme.palette.border.modal}`,
              flexShrink: 0,
              ...(isMobile && step === "summary"
                ? { flexDirection: "column", gap: 1.5 }
                : isMobile && { "& > button": { flex: 1 } }),
            }}
          >
            {step === "select" && (
              <>
                <CancelButton onClick={requestClose} sx={{ paddingX: 4 }}>
                  Cancelar
                </CancelButton>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ paddingX: 4, boxShadow: 0 }}
                  disabled={selectedChannels.length < 1}
                  onClick={() => setStep("summary")}
                >
                  Continuar
                </Button>
              </>
            )}

            {step === "summary" && (
              <>
                <Button
                  variant={isMobile ? "outlined" : "text"}
                  onClick={() => setStep("select")}
                  fullWidth={isMobile}
                  sx={{ paddingX: 4 }}
                >
                  Cambiar configuración
                </Button>
                <Button
                  onClick={submitForm}
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    isSubmitting || !isValid || updateSocialMediaPending
                  }
                  fullWidth={isMobile}
                  sx={{ paddingX: 4 }}
                >
                  {updateSocialMediaPending ? "Guardando..." : "Finalizar"}
                </Button>
              </>
            )}

            {step === "detail" && (
              <Button
                onClick={handleSaveDetail}
                variant="contained"
                color="primary"
                sx={{ paddingX: 4, boxShadow: 0 }}
                fullWidth={isMobile}
              >
                Guardar
              </Button>
            )}
          </DialogActions>
        )}
        </InsetSurface>
      </Dialog>

      <ConfirmationDialog
        open={unsavedConfirmOpen}
        title="¿Salir sin guardar los cambios?"
        content="Tienes cambios en los canales que no se guardarán hasta que toques Finalizar. Si sales ahora, se perderán."
        cancelText="Seguir editando"
        confirmText="Salir sin guardar"
        confirmColor="error"
        onClose={() => setUnsavedConfirmOpen(false)}
        onConfirm={() => {
          setUnsavedConfirmOpen(false);
          onClose();
        }}
      />
    </Form>
  );
};
