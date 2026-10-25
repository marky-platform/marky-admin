import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import QRCode from "qrcode";
import React, { useEffect, useState } from "react";

const QR_WIDTH = 256;

interface ArQrDialogProps {
  open: boolean;
  onClose: () => void;
  /** URL pública del producto con el ítem 3D seleccionado (`?view=3d`). */
  url: string;
}

// Escritorio sin AR: QR para abrir el producto en el celular y desde ahí
// tocar "Ver en tu espacio". Mismo `toDataURL` que useProfileShareActions.
const ArQrDialog: React.FC<ArQrDialogProps> = ({ open, onClose, url }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setDataUrl(null);
    setFailed(false);
    QRCode.toDataURL(url, { width: QR_WIDTH, margin: 2 })
      .then((result) => {
        if (!cancelled) setDataUrl(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, url]);

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="ar-qr-dialog-title">
      <DialogTitle id="ar-qr-dialog-title">Ver en tu celular</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: QR_WIDTH,
            height: QR_WIDTH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Código QR del producto"
              width={QR_WIDTH}
              height={QR_WIDTH}
            />
          ) : failed ? (
            <Typography variant="body2" color="error">
              No se pudo generar el código QR
            </Typography>
          ) : (
            <CircularProgress aria-label="Generando código QR" />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Escanea con tu celular para ver el producto en tu espacio.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArQrDialog;
