import AdminOrderDetailsSection from "@/components/AdminOrderDetailsSection";
import { getOrderById } from "@/services/apiOrders";
import React from "react";

export default async function page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-primarygreen-500 mb-6">
        Admin Dashboard - Order details
      </h1>
      <AdminOrderDetailsSection />
    </div>
  );
}
