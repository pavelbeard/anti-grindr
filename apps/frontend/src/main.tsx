import MainPage from "@/MainPage";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MainPage />
    </BrowserRouter>
  </StrictMode>,
);
