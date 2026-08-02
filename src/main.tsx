import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { assertProductionEnv } from "./lib/env";

try {
  assertProductionEnv();
} catch (err) {
  console.error(err);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
