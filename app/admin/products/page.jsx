import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getAllProducts } from "@/services/apiProducts";
import { getCategoriesWithCounts } from "@/services/apiCategories";
import { ProductKeys } from "@/lib/productkeys";
import { CategoryKeys } from "@/lib/categoryKeys";
import AdminProductsSection from "@/components/AdminProductsSection";
import SkeletonAdminProductsSection from "@/components/SkeletonAdminProductsSection";

export const dynamic = "force-dynamic";

async function ProductsContent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  try {
    // Prefetch products
    await queryClient.prefetchQuery({
      queryKey: ProductKeys.list({}),
      queryFn: async () => {
        const result = await getAllProducts();
        if (result?.success) {
          return result.products;
        }
        throw new Error(result?.error || "Failed to fetch products");
      },
    });

    // Prefetch categories for filters
    await queryClient.prefetchQuery({
      queryKey: CategoryKeys.list(),
      queryFn: async () => {
        const result = await getCategoriesWithCounts();
        if (result?.success) {
          return result.categories;
        }
        throw new Error(result?.error || "Failed to fetch categories");
      },
    });
  } catch (error) {
    console.error("Error prefetching data:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminProductsSection />
    </HydrationBoundary>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-primarygreen-500 mb-6">
        Admin Dashboard - Products
      </h1>

      <Suspense fallback={<SkeletonAdminProductsSection />}>
        <ProductsContent />
      </Suspense>
    </div>
  );
}
