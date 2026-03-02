import React from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./App.css";

// import "leaflet/dist/leaflet.css";
// import "./components/.js"; // ✅ correct path (yours is inside components)

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);