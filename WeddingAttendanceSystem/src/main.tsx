import "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { WeddingProvider } from "./providers/WeddingProvider";
import "./styles/wedding.css";
import "./index.css";
import App from "./App";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WeddingProvider>
          <App />
        </WeddingProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
