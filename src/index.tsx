import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { startSessionSync } from "./stores/sessionSync";

// Sincroniza login/logout entre pestañas (evento `storage`).
startSessionSync();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
