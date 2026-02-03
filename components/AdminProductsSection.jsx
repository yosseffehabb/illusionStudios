"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CirclePlus,
  Search,
  X,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import Link from "next/link";
import AdminProductCard from "@/components/AdminProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";

export default function AdminProductsSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch data
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const isLoading = productsLoading || categoriesLoading;

  /* -------- Filtered Products -------- */
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category?.id === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  /* -------- Category Counts -------- */
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((product) => {
      const categoryId = product.category?.id;
      if (categoryId) {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  /* -------- Clear Filters -------- */
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  /* -------- Loading State -------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primarygreen-500" />
      </div>
    );
  }

  /* -------- Error State -------- */
  if (productsError) {
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Failed to load products</p>
          <p className="text-sm">
            {productsError.message || "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Search & Add */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primarygreen-500" />
            <Input
              placeholder="Search by name, color, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 w-full placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primarygreen-500 focus:border-primarygreen-500 focus-visible:ring-2 focus-visible:ring-primarygreen-500 focus-visible:ring-offset-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Link href="/admin/products/add">
            <Button className="w-full sm:w-[180px] h-10 bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700 transition-all">
              Add Product <CirclePlus />
            </Button>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-primarygreen-500 text-primarygreen-50"
                : "bg-primarygreen-50 text-primarygreen-500 hover:bg-primarygreen-100"
            }`}
          >
            All ({products.length})
          </button>

          {categories.map((category) => {
            const count = categoryCounts[category.id] || 0;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? "bg-primarygreen-500 text-primarygreen-50"
                    : "bg-primarygreen-50 text-primarygreen-500 hover:bg-primarygreen-100"
                }`}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State - No Products at All */}
      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No products yet</p>
          <Link href="/admin/products/add">
            <Button className="bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700">
              Add your first product
            </Button>
          </Link>
        </div>
      )}

      {/* Empty State - No Results After Filtering */}
      {products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No products found
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="text-primarygreen-500 border-primarygreen-500 hover:bg-primarygreen-50"
              >
                Clear filters
              </Button>
            </>
          )}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <AdminProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Results Counter */}
          <div className="mt-4 text-sm text-muted-foreground text-center sm:text-left">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </>
      )}
    </div>
  );
}
