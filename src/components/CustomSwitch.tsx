import Switch, { SwitchProps } from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

// Réplica del switch de Figma: pista celeste (secondary.main) con el
// thumb en azul oscuro (#337AEA) cuando está activo — al revés del patrón
// habitual de MUI (pista de color, thumb blanco). Las medidas (pista
// 37x22, thumb 14px, recorrido 15px) coinciden con las del switch "estilo
// iOS" documentado por MUI, así que solo se ajustan los colores.
const CustomSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 37,
  height: 22,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 4,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(15px)",
      color: theme.palette.accent.link,
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.secondary.main,
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 14,
    height: 14,
  },
  "& .MuiSwitch-track": {
    borderRadius: 22 / 2,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
  },
}));

export default CustomSwitch;
