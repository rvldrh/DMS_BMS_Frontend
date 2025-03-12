// /pages/invoiceDMS/layout.js
import { Sidebar } from "@/app/component/sidebar"; // Adjust the import path as necessary
import React from "react";

const Layout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main
        style={{
          flex: 1, // This allows the main content to take the remaining space
          padding: "20px",
          overflowX: "hidden", // Prevent horizontal scrolling
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;