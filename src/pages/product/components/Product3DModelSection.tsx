import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { Box, Button, Typography } from "@mui/material";
import { useFormikContext } from "formik";
import React from "react";
import { Model3dKind, validateModel3dFile } from "../../../utils/model3dValidation";
import { Product, Product3DModel } from "../../../types/product";
import {
  isDeletePending,
  removeGlb,
  removeUsdz,
  selectGlb,
  selectUsdz,
} from "../../../utils/model3dFormState";
import { ShowNotification } from "../../../utils/utils";

interface Product3DModelSectionProps {
  uploadProgress?: number | null;
  isSaving?: boolean;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const nameFromUrl = (url: string) => {
  try {
    return decodeURIComponent(new URL(url, "http://x").pathname.split("/").pop() || url);
  } catch {
    return url;
  }
};

const describeFile = (file: File | string) =>
  typeof file === "string"
    ? nameFromUrl(file)
    : `${file.name} (${formatSize(file.size)})`;

interface FileRowProps {
  kind: Model3dKind;
  title: string;
  hint: string;
  accept: string;
  file: File | string | null | undefined;
  caption?: string;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const FileRow = ({
  kind,
  title,
  hint,
  accept,
  file,
  caption,
  disabled,
  onSelect,
  onRemove,
}: FileRowProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const label = kind.toUpperCase();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) onSelect(selected);
    // Permite volver a elegir el mismo archivo tras un rechazo o una quita.
    event.target.value = "";
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        bgcolor: "grey.50",
        borderRadius: 4,
        px: 3,
        py: 2,
      }}
    >
      <input
        type="file"
        accept={accept}
        ref={inputRef}
        onChange={handleChange}
        style={{ display: "none" }}
        data-testid={`model3d-${kind}-input`}
        tabIndex={-1}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" fontWeight="bold" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {hint}
        </Typography>
        {file && (
          <Typography variant="body2" sx={{ mt: 0.5, wordBreak: "break-all" }}>
            {caption ?? describeFile(file)}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          aria-label={`${file ? "Reemplazar" : "Subir"} ${label}`}
          onClick={() => inputRef.current?.click()}
          sx={{ px: 2 }}
        >
          {file ? "Reemplazar" : "Subir"}
        </Button>
        {file && (
          <Button
            size="small"
            color="error"
            disabled={disabled}
            aria-label={`Quitar ${label}`}
            onClick={onRemove}
            sx={{ px: 2 }}
          >
            Quitar
          </Button>
        )}
      </Box>
    </Box>
  );
};

const Product3DModelSection: React.FC<Product3DModelSectionProps> = ({
  uploadProgress = null,
  isSaving = false,
}) => {
  const { values, errors, setFieldValue } = useFormikContext<Product>();
  const stored = values.model3d ?? null;
  // Un modelo marcado para borrar se muestra como vacío.
  const model: Product3DModel | null = stored?._delete ? null : stored;
  const error = typeof errors.model3d === "string" ? errors.model3d : undefined;

  const hasPendingUpload = (file: File | string | null | undefined) =>
    file instanceof File;
  const captionFor = (file: File | string | null | undefined) => {
    if (!isSaving || !hasPendingUpload(file)) return undefined;
    if (uploadProgress === null) return "Procesando...";
    return `Subiendo...${uploadProgress}%`;
  };

  const select = (kind: Model3dKind, file: File) => {
    const validationError = validateModel3dFile(file, kind);
    if (validationError) {
      ShowNotification({ message: validationError, type: "error" });
      return;
    }
    if (kind === "glb") {
      setFieldValue("model3d", selectGlb(stored, file));
    } else if (isDeletePending(stored)) {
      ShowNotification({ message: "Sube primero el archivo GLB.", type: "error" });
    } else {
      setFieldValue("model3d", selectUsdz(stored, file));
    }
  };

  const handleRemoveGlb = () => setFieldValue("model3d", removeGlb(stored));
  const handleRemoveUsdz = () => setFieldValue("model3d", removeUsdz(stored));

  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.palette.border.field}`,
        borderRadius: 2,
        p: { xs: 4, md: 5 },
        mt: 5,
      }}
    >
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <ViewInArIcon />
        <Typography variant="h6" fontWeight="bold">
          Modelo 3D y realidad aumentada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Opcional
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sube un modelo 3D para que tus clientes vean el producto desde todos los
        ángulos. Máximo 25MB por archivo.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <FileRow
          kind="glb"
          title="GLB (obligatorio para el modelo)"
          hint="Se usa para ver el producto en 3D y en realidad aumentada en Android."
          accept=".glb,model/gltf-binary"
          file={model?.glbFile}
          caption={captionFor(model?.glbFile)}
          disabled={isSaving}
          onSelect={(f) => select("glb", f)}
          onRemove={handleRemoveGlb}
        />
        <FileRow
          kind="usdz"
          title="USDZ (opcional)"
          hint="Mejora la realidad aumentada en iPhone y iPad."
          accept=".usdz,model/vnd.usdz+zip"
          file={model?.usdzFile}
          caption={captionFor(model?.usdzFile)}
          disabled={isSaving}
          onSelect={(f) => select("usdz", f)}
          onRemove={handleRemoveUsdz}
        />
      </Box>
      {error && (
        <Typography variant="caption" color="error" role="alert" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default Product3DModelSection;
