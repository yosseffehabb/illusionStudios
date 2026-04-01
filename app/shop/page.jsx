import ClientShop from "@/components/ClientShop";
import React from "react";

export default function page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="sm:text-2xl text-2xl font-semibold text-primarygreen-500  text-center tracking-wider uppercase sm:mb-7  ">
        SHOP
      </h1>
      <ClientShop />
    </div>
  );
}
