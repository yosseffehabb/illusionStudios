import AdminAddProductForm from "@/components/AdminAddProductForm";
import React from "react";

export default function page() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-primarygreen-500 mb-6">
        Admin Dashboard - add product
      </h1>
      <AdminAddProductForm />
    </div>
  );
}
