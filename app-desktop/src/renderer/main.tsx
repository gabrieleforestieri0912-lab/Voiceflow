import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Overlay from "./Overlay";
import Onboarding from "./Onboarding";
import "./index.css";

const hash = window.location.hash.replace(/^#/, "");
const isOverlay = hash === "overlay";
const isOnboarding = hash === "onboarding";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

let view: React.ReactNode;
if (isOverlay) view = <Overlay />;
else if (isOnboarding) view = <Onboarding />;
else view = <App />;

createRoot(root).render(<React.StrictMode>{view}</React.StrictMode>);
