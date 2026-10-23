import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeIcon from "@mui/icons-material/QrCode";
import ShareIcon from "@mui/icons-material/Share";
import QRCode from "qrcode";
import { ProfileActionItem } from "../components/ProfileActionsMenu";
import { withSourceParam } from "../analytics/source";
import { getPublicBusinessUrl } from "../utils/publicUrls";
import { ShowNotification } from "../utils/utils";

interface UseProfileShareActionsParams {
  businessId?: string;
  businessName?: string;
}

const QR_WIDTH = 512;

const notifyError = (message: string) =>
  ShowNotification({ message, type: "error" });

const copyToClipboard = async (url: string) => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Sin portapapeles");
    await navigator.clipboard.writeText(url);
    ShowNotification({ message: "Enlace copiado", type: "success" });
  } catch {
    notifyError("No se pudo copiar el enlace");
  }
};

const downloadQr = async (url: string, businessId: string) => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: QR_WIDTH,
      margin: 2,
    });
    const safeId = businessId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-${safeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    notifyError("No se pudo generar el código QR");
  }
};

const share = async (url: string, businessName: string) => {
  if (typeof navigator.share !== "function") {
    await copyToClipboard(url);
    return;
  }
  try {
    await navigator.share({ title: businessName, text: businessName, url });
  } catch (error) {
    // Cancelar la hoja de compartir no es un error.
    if ((error as DOMException)?.name === "AbortError") return;
    await copyToClipboard(url);
  }
};

// Acciones de perfil compartidas (admin y público): compartir, copiar enlace y
// descargar QR, sobre la URL pública canónica del negocio (enlace: mk_source=public_link,
// QR: mk_source=qr).
const useProfileShareActions = ({
  businessId,
  businessName,
}: UseProfileShareActionsParams): ProfileActionItem[] => {
  // La fuente viaja en la URL (?mk_source=) para distinguir enlace público
  // de QR en las visitas.
  const run =
    (
      source: "public_link" | "qr",
      action: (url: string, id: string) => Promise<void>,
    ) =>
    () => {
      if (!businessId) {
        notifyError("El enlace del perfil todavía no está disponible");
        return;
      }
      void action(
        withSourceParam(getPublicBusinessUrl(businessId), source),
        businessId,
      );
    };

  return [
    {
      icon: ShareIcon,
      text: "Compartir perfil",
      onClick: run("public_link", (url) => share(url, businessName || businessId || "")),
    },
    {
      icon: ContentCopyIcon,
      text: "Copiar URL del perfil",
      onClick: run("public_link", (url) => copyToClipboard(url)),
    },
    {
      icon: QrCodeIcon,
      text: "Descargar código QR",
      onClick: run("qr", downloadQr),
    },
  ];
};

export default useProfileShareActions;
