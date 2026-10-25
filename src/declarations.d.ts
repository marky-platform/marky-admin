declare module "*.mp4" {
  const src: string;
  export default src;
}

// <model-viewer> (@google/model-viewer) como elemento JSX. Solo lo usa
// `components/ProductModelViewer.tsx`. Los atributos booleanos (`ar`,
// `camera-controls`) se pasan como "" para que React 18 los escriba presentes.
declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string;
      "ios-src"?: string;
      alt?: string;
      ar?: string;
      "ar-modes"?: string;
      "ar-placement"?: "floor" | "wall";
      "camera-controls"?: string;
      "touch-action"?: "pan-y" | "pan-x" | "none";
      loading?: "auto" | "lazy" | "eager";
    };
  }
}
