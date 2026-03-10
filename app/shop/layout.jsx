import ClientHeader from "@/components/ClientHeader";
import React from "react";

export default function layout({ children }) {
  return (
    <div>
      <ClientHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {children}
      </main>
    </div>
  );
}
