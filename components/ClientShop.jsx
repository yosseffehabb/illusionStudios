"use client";

import { useState, useMemo } from "react";
import { useActiveProducts } from "@/hooks/useProducts";
import { AlertCircle, ChevronDownIcon, Loader2, Package } from "lucide-react";
import ClientProductCard from "./ClientProductCard";
import { useCategories } from "@/hooks/useCategories";

export default function ClientShop() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: ActiveProducts = [],
    isLoading: isActiveProductsLoading,
    error: isActiveProductsError,
  } = useActiveProducts();
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: isCategoriesError,
  } = useCategories();

  /* -------- Filtered Products -------- */
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(ActiveProducts)) return [];
    return ActiveProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category?.id === selectedCategory;
      return matchesCategory;
    });
  }, [ActiveProducts, selectedCategory]);

  /* -------- Loading State -------- */
  if (isActiveProductsLoading || isCategoriesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primarygreen-500" />
      </div>
    );
  }

  /* -------- Error States -------- */
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

  if (isCategoriesError) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Failed to load Categories</p>
          <p className="text-sm">
            {isCategoriesError.message || "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Category Dropdown */}

      <div className="flex justify-center mb-6 ">
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm font-medium bg-transparent text-neutral-400 focus:outline-none cursor-pointer"
          >
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Empty State — No Results After Filtering */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No products found
          </p>
          {selectedCategory !== "all" && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-primarygreen-500 text-primarygreen-500 hover:bg-primarygreen-50 transition-all"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ClientProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center sm:text-left">
            Showing {filteredProducts.length} of {ActiveProducts.length}{" "}
            products
          </div>
        </>
      )}
    </div>
  );
}
