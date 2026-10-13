import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Onboarding } from "./Onboarding";
import { Overlay } from "./Overlay";

function Router() {
  const hash = window.location.hash;
  if (hash.startsWith("#onboarding")) return <Onboarding />;
  if (hash.startsWith("#overlay")) return <Overlay />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
