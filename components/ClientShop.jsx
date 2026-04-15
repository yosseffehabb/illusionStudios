"use client";

import { useState, useMemo } from "react";
import { useActiveProducts } from "@/hooks/useProducts";
import { Package, ChevronDown } from "lucide-react";
import ClientProductCard from "./ClientProductCard";
import { useCategories } from "@/hooks/useCategories";
import ClientLoadingState from "./ClientLoadingState";
import ClientErrorState from "./ClientErrorState";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClientShop() {
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

  const [selectedCategory, setSelectedCategory] = useState("all");

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
    return <ClientLoadingState text="loading shop" />;
  }

  /* -------- Error States -------- */
  if (isActiveProductsError) {
    return (
      <ClientErrorState
        errorHeading="faild to load products"
        errorBody="an error has occuerd"
      />
    );
  }

  if (isCategoriesError) {
    return (
      <ClientErrorState
        errorHeading="Faild to Load categories"
        errorBody="an error has occuerd"
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Filter Section */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 pt-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Category Filter Dropdown */}
        <div className="w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-auto h-10 border-0 bg-transparent hover:bg-muted/50 transition-all duration-200 focus:ring-0 focus:ring-offset-0 text-center px-4 rounded-lg ">
              <div className="flex items-center justify-center gap-2 w-full">
                <SelectValue placeholder="Filter by category" />
                <motion.div
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.2 }}
                ></motion.div>
              </div>
            </SelectTrigger>
            <SelectContent className="w-full sm:w-56">
              <SelectItem value="all">
                <span className=" text-primarygreen-700">All </span>
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <span className="text-center">{category.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Empty State — No Results After Filtering */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-primarygreen-700" />
          <p className="text-lg font-semibold text-foreground mb-2">
            No products found
          </p>
          {selectedCategory !== "all" && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your filters
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-6 py-2 rounded-lg text-sm font-medium border border-primarygreen-500 bg-primarygreen-700 text-primarygreen-50 hover:bg-primarygreen-50 hover:text-primarygreen-700 transition-all duration-200"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ClientProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
              Showing{" "}
              <span className="font-semibold">{filteredProducts.length}</span>{" "}
              of <span className="font-semibold">{ActiveProducts.length}</span>{" "}
              products
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
