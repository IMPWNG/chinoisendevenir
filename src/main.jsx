import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import Home from "./pages/Home.jsx";
import AVenir from "./pages/AVenir.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/a-venir" element={<AVenir />} />
          <Route path="/a-venir.html" element={<AVenir />} /> */}
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
);
