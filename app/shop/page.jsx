
import ClientShop from "@/components/ClientShop";
import React from "react";

export default function page() {

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="sm:text-2xl text-xl font-semibold text-primarygreen-500 mb-6 text-center  pb-6 tracking-wider uppercase ">
        SHOP
      </h1>
      <ClientShop/>
    </div>
  );
}
