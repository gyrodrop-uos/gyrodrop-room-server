import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { Controller } from "./pages/Controller";
import { Landing } from "./pages/Landing";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/c" element={<Controller />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
