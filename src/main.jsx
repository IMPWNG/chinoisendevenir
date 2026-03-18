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
import GuideEtudier from "./pages/GuideEtudier.jsx";
import Expatrier from "./pages/Expatrier.jsx";
import VisaChine from "./pages/VisaChine.jsx";
import TravaillerChine from "./pages/TravaillerChine.jsx";
import LogementChine from "./pages/LogementChine.jsx"

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Analytics />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/etudier" element={<Etude />} />
        <Route
          path="/etudier/guide-etudier-en-chine"
          element={<GuideEtudier />}
        />
        <Route path="/expatrier" element={<Expatrier />} />
        <Route path="/expatrier/visa-chine" element={<VisaChine />} />
        <Route path="/tourisme" element={<Tourisme />} />
        <Route path="expatrier/logement-en-chine" element={<LogementChine />} />
        <Route path="/indispensables" element={<Indispensables />} />
        <Route
          path="/expatrier/travailler-en-chine"
          element={<TravaillerChine />}
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/a-venir" element={<AVenir />} />
        <Route path="/a-venir.html" element={<AVenir />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
