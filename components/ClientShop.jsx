"use client"

import { useActiveProducts } from "@/hooks/useProducts";
import { AlertCircle, Loader2 } from "lucide-react";
import AdminProductCard from "./AdminProductCard";
import ClientProductCard from "./ClientProductCard";

export default function ClientShop() {
     const { data:ActiveProducts, isLoading:isActiveProductsLoading, error:isActiveProductsError } = useActiveProducts();


/* -------- Loading State -------- */
  if (isActiveProductsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primarygreen-500" />
      </div>
    );
  }

  /* -------- Error State -------- */
  if (isActiveProductsError) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Failed to load products</p>
          <p className="text-sm">
            {isActiveProductsError.message || "An error occurred"}
          </p>
        </div>
      </div>
    );
  }



     console.log(ActiveProducts)
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                       {ActiveProducts.map((ActiveProduct) => (
                         <ClientProductCard key={ActiveProduct.id} product={ActiveProduct} />
                       ))}
                     </div>
        );
}       