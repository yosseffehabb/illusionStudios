"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/services/apiProducts";
import { ProductKeys } from "@/lib/productkeys";

/* ================================
   Get Products
================================ */
export function useProducts(options = {}) {
  return useQuery({
    queryKey: ProductKeys.list({}),
    queryFn: async () => {
      const result = await getAllProducts();

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch products");
      }

      return result.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (same as categories)
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: Boolean(options.enabled ?? true),
  });
}
