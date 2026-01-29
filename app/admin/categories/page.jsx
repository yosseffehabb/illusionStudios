import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCategoriesWithCounts } from "@/services/apiCategories";
import { categoryKeys } from "@/lib/categoryKeys"; 
import SkeletonAdminCategoriesSection from "@/components/SkeletonAdminCategoriesSection";
import AdminCategoriesSection from "@/components/AdminCategoriesSection";

async function CategoriesContent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
      },
    },
  });

  try {
    // Prefetch categories with product counts
    await queryClient.prefetchQuery({
      queryKey: categoryKeys.list(),
      queryFn: async () => {
        const result = await getCategoriesWithCounts();
        if (result?.success) {
          return result.categories;
        }
        throw new Error(result?.error || "Failed to fetch categories");
      },
    });
  } catch (error) {
    console.error("Error prefetching categories:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <AdminCategoriesSection/>
    </HydrationBoundary>
  );
}

export default function AdminCategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-primarygreen-500 mb-6">
        Admin Dashboard - Categories
      </h1>

      <Suspense fallback={<SkeletonAdminCategoriesSection />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}