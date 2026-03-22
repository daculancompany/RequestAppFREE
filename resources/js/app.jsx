//@ts-nocheck

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Optional
import AppRouter from "./src/router.jsx";
import "antd/dist/reset.css";
import "@/styles/themes.scss";

// Configuration based on environment
//const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === "development";
const isDevelopment = false;
// Create QueryClient with environment-aware settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: isDevelopment ? 0 : 1, // No retry in dev for faster error feedback
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,  //always
      refetchOnReconnect: "always",
      // Development-specific settings
      ...(isDevelopment && {
        // Keep data fresh longer in dev to reduce requests
        staleTime: 2 * 60 * 1000, // 2 minutes in dev
      }),
    },
    mutations: {
      retry: isDevelopment ? 0 : 1,
    },
  },
  // Optional: QueryClient configuration
  // logger: {
  //   log: console.log,
  //   warn: console.warn,
  //   error: console.error,
  // },
});



ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      {/* Show React Query Devtools only in development */}
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  </React.StrictMode>
);