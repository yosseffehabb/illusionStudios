import { Suspense } from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import {
  getPaginatedOrders,
  getOrderStatsOptimized,
} from "@/services/apiOrders";
import { orderKeys } from "@/lib/orderKeys";
import AdminOrderStats from "@/components/AdminOrderStats";
import AdminOrdersTable from "@/components/AdminOrdersTable";
import SkeletonAdminOrdersTable from "@/components/SkeletonAdminOrdersTable";
import SkeletonAdminOrderStats from "@/components/SkeletonAdminOrderStats";

async function OrdersContent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
      },
    },
  });

  try {
    // Use consistent filter structure with client
    const defaultFilters = { status: null };

    // Prefetch first page of orders
    await queryClient.prefetchInfiniteQuery({
      queryKey: orderKeys.infinite(defaultFilters),
      queryFn: async ({ pageParam = 0 }) => {
        const result = await getPaginatedOrders({
          page: pageParam,
          limit: 50,
          status: defaultFilters.status,
        });

        if (result?.success) {
          return result;
        }
        throw new Error(result?.error || "Failed to fetch orders");
      },
      initialPageParam: 0,
      pages: 1,
    });

    // Prefetch stats
    await queryClient.prefetchQuery({
      queryKey: orderKeys.stats(),
      queryFn: async () => {
        const result = await getOrderStatsOptimized();
        if (result?.success) {
          return result.stats;
        }
        throw new Error(result?.error || "Failed to fetch stats");
      },
    });
  } catch (error) {
    console.error("Error prefetching data:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOrderStats />
      <AdminOrdersTable />
    </HydrationBoundary>
  );
}

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-primarygreen-500 mb-6">
        Admin Dashboard - Orders
      </h1>

      <Suspense
        fallback={
          <>
            {/* Stats Skeleton */}
           <SkeletonAdminOrderStats/>
            {/* Table Skeleton */}
            <SkeletonAdminOrdersTable/>
          </>
        }
      >
        <OrdersContent />
      </Suspense>
    </div>
  );
}