'use client'

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Sidebar } from "./component/sidebar";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <div 
          // style={{ display: "flex" }}
          >
            <main
              // style={{
              //   marginLeft: "16rem", /* Sidebar width (64rem) */
              //   padding: "20px",
              //   width: "100%",
              // }}
            >
              {children} {/* Main content */}
            </main>
          </div>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </body>
    </html>
  );
}
