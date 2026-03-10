import { getActiveProducts } from "@/services/apiProducts";
import React from "react";

export default async function page() {
  const products = await getActiveProducts();
  console.log(products);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="sm:text-2xl text-xl font-semibold text-primarygreen-500 mb-6 text-center tracking-wider uppercase ">
        SHOP
      </h1>
    </div>
  );
}
