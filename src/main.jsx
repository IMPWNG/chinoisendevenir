import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Landing from "./pages/Landing.jsx";
import Etude from "./pages/Etude.jsx";
import AVenir from "./pages/AVenir.jsx";
import Contact from "./pages/Contact.jsx";
import Indispensables from "./pages/Indispensables.jsx";
import Tourisme from "./pages/Tourisme.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/etudier" element={<Etude />} />
        <Route path="/a-venir" element={<AVenir />} />
        <Route path="/a-venir" element={<AVenir />} />
        <Route path="/tourisme" element={<Tourisme />} />;
        <Route path="/indispensables" element={<Indispensables />} />;
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
// ...



// ...
