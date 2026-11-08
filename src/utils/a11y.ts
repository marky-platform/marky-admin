import type { KeyboardEvent } from "react";

/**
 * Teclado para elementos no nativos (Box/Card/div) que actúan como botón:
 * Enter o Espacio disparan el mismo `onClick` que el mouse. Solo reacciona a
 * teclas pulsadas sobre el propio elemento (no sobre controles hijos, como un
 * IconButton anidado, que ya manejan su teclado).
 */
export function activateOnKey(event: KeyboardEvent<HTMLElement>): void {
  if (event.target !== event.currentTarget) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.currentTarget.click();
  }
}

/**
 * Props para convertir un contenedor clickeable en un botón accesible:
 * `<Box onClick={...} {...clickableProps}>`. Para estados deshabilitados:
 * `{...(disabled ? {} : clickableProps)}`.
 */
export const clickableProps = {
  role: "button",
  tabIndex: 0,
  onKeyDown: activateOnKey,
} as const;
