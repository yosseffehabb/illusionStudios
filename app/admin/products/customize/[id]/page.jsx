import AdminCustomizeProductForm from "@/components/AdminCustomizeProductForm";
import React from "react";

export default async function page({ params }) {
  const resolvedParams = await params;
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-primarygreen-500 mb-6">
        Admin Dashboard - Customize product
      </h1>
      <AdminCustomizeProductForm
        key={resolvedParams.id}
        productId={resolvedParams.id}
      />
    </div>
  );
}
