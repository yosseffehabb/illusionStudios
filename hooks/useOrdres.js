"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getPaginatedOrders,
  searchOrdersPaginated,
  getOrderStatsOptimized,
  getOrdersByPhone,
  getOrderByNumber,
  updateOrderStatus as updateOrderStatusAction,
  deleteOrder as deleteOrderAction,
} from "@/services/apiOrders";
import { orderKeys } from "@/lib/orderKeys";
import { CACHE_TIMES } from "@/lib/constants";

// ============================================
// ADMIN HOOKS
// ============================================

/**
 * Infinite scroll hook for browsing orders (Admin)
 */
export function useInfiniteOrders(filters = {}, options = {}) {
  const normalizedFilters = {
    status: filters.status || null,
  };

  return useInfiniteQuery({
    queryKey: orderKeys.infinite(normalizedFilters),
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getPaginatedOrders({
        page: pageParam,
        limit: 50,
        status: normalizedFilters.status,
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch orders");
      }

      return result;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    initialPageParam: 0,
    staleTime: CACHE_TIMES.ORDERS.STALE_TIME,
    gcTime: CACHE_TIMES.ORDERS.GC_TIME,
    refetchOnWindowFocus: true,
    // React Query v5: enabled must be boolean or () => boolean
    enabled: Boolean(options.enabled ?? true), // Allow conditional execution
  });
}

/**
 * Search orders hook (Admin)
 */
export function useSearchOrders(searchQuery, filters = {}, options = {}) {
  const normalizedFilters = {
    status: filters.status || null,
  };

  return useQuery({
    queryKey: orderKeys.search(searchQuery, normalizedFilters),
    queryFn: async () => {
      const result = await searchOrdersPaginated(searchQuery, normalizedFilters);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to search orders");
      }

      return result.orders;
    },
    // Force enabled to always be a strict boolean
    enabled: Boolean(options.enabled ?? true) && !!searchQuery && searchQuery.length > 0,
    staleTime: CACHE_TIMES.SEARCH.STALE_TIME,
    gcTime: CACHE_TIMES.SEARCH.GC_TIME,
  });
}

/**
 * Order statistics hook (Admin)
 */
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: async () => {
      const result = await getOrderStatsOptimized();

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch stats");
      }

      return result.stats;
    },
    staleTime: CACHE_TIMES.STATS.STALE_TIME,
    gcTime: CACHE_TIMES.STATS.GC_TIME,
    refetchOnWindowFocus: true,
  });
}

/**
 * Smart hook that switches between browse and search modes (Admin)
 * OPTIMIZED: Only executes one hook at a time
 */
export function useOrders(searchQuery = "", filters = {}) {
  const hasSearch = searchQuery && searchQuery.trim().length > 0;
  // Only treat as "search mode" when there's a text search.
  // Pure status filters should still use the infinite (paginated) query.
  const isSearchMode = hasSearch;

  // Only enable the hook we're actually using
  const searchResult = useSearchOrders(searchQuery, filters, {
    enabled: isSearchMode,
  });

  const infiniteResult = useInfiniteOrders(filters, {
    enabled: !isSearchMode,
  });

  // Return appropriate result based on mode
  if (isSearchMode) {
    return {
      data: searchResult.data || [],
      isLoading: searchResult.isLoading,
      error: searchResult.error,
      isFetching: searchResult.isFetching,
      fetchNextPage: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      mode: "search",
    };
  }

  // Flatten infinite pages into single array
  const orders =
    infiniteResult.data?.pages.flatMap((page) => page.orders) || [];

  return {
    data: orders,
    isLoading: infiniteResult.isLoading,
    error: infiniteResult.error,
    isFetching: infiniteResult.isFetching,
    fetchNextPage: infiniteResult.fetchNextPage,
    hasNextPage: infiniteResult.hasNextPage,
    isFetchingNextPage: infiniteResult.isFetchingNextPage,
    mode: "infinite",
  };
}

/**
 * Get total count of orders (Admin)
 */
export function useOrdersCount() {
  const { data } = useInfiniteOrders();
  return data?.pages[0]?.totalCount || 0;
}

/**
 * Check if currently in search mode (Admin)
 */
export function useIsSearchMode(searchQuery, filters) {
  const hasSearch = searchQuery && searchQuery.trim().length > 0;
  const hasStatusFilter = filters?.status && filters.status !== "all";
  return hasSearch || hasStatusFilter;
}

// ============================================
// CUSTOMER HOOKS (Public)
// ============================================

/**
 * Get customer orders by phone (Public)
 */
export function useOrdersByPhone(phone, options = {}) {
  return useQuery({
    queryKey: orderKeys.byPhone(phone),
    queryFn: async () => {
      const result = await getOrdersByPhone(phone);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch orders");
      }

      return result.orders;
    },
    enabled: (options.enabled ?? true) && !!phone && phone.length >= 10,
    staleTime: CACHE_TIMES.ORDERS.STALE_TIME,
    gcTime: CACHE_TIMES.ORDERS.GC_TIME,
    retry: 1, // Only retry once for public endpoints
  });
}

/**
 * Get single order by order number (Public)
 */
export function useOrderByNumber(orderNumber, options = {}) {
  return useQuery({
    queryKey: orderKeys.byOrderNumber(orderNumber),
    queryFn: async () => {
      const result = await getOrderByNumber(orderNumber);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to fetch order");
      }

      return result.order;
    },
    enabled:
      (options.enabled ?? true) && !!orderNumber && orderNumber.length > 0,
    staleTime: CACHE_TIMES.ORDERS.STALE_TIME,
    gcTime: CACHE_TIMES.ORDERS.GC_TIME,
    retry: 1,
  });
}

// ============================================
// MUTATION HOOKS (Admin)
// ============================================

/**
 * Update order status mutation (Admin)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const result = await updateOrderStatusAction(orderId, newStatus);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to update order status");
      }

      return result.order;
    },

    onMutate: async ({ orderId, newStatus }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: orderKeys.all });

      // Snapshot previous values
      const previousInfiniteQueries = queryClient.getQueriesData({
        queryKey: orderKeys.all,
      });

      // Optimistically update infinite queries
      queryClient.setQueriesData(
        { queryKey: [...orderKeys.all, "infinite"] },
        (oldData) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              orders: page.orders.map((order) =>
                order.id === orderId
                  ? {
                      ...order,
                      status: newStatus,
                      updated_at: new Date().toISOString(),
                    }
                  : order
              ),
            })),
          };
        }
      );

      // Optimistically update search queries
      queryClient.setQueriesData(
        { queryKey: [...orderKeys.all, "search"] },
        (oldData) => {
          if (!Array.isArray(oldData)) return oldData;

          return oldData.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: newStatus,
                  updated_at: new Date().toISOString(),
                }
              : order
          );
        }
      );

      return { previousInfiniteQueries };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousInfiniteQueries) {
        context.previousInfiniteQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("Failed to update order status:", error);
    },

    onSuccess: () => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

/**
 * Delete order mutation (Admin)
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId) => {
      const result = await deleteOrderAction(orderId);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to delete order");
      }

      return orderId;
    },

    onMutate: async (orderId) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.all });

      const previousInfiniteQueries = queryClient.getQueriesData({
        queryKey: orderKeys.all,
      });

      // Optimistically remove from infinite queries
      queryClient.setQueriesData(
        { queryKey: [...orderKeys.all, "infinite"] },
        (oldData) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              orders: page.orders.filter((order) => order.id !== orderId),
              totalCount: page.totalCount - 1,
            })),
          };
        }
      );

      // Optimistically remove from search queries
      queryClient.setQueriesData(
        { queryKey: [...orderKeys.all, "search"] },
        (oldData) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.filter((order) => order.id !== orderId);
        }
      );

      return { previousInfiniteQueries };
    },

    onError: (error, variables, context) => {
      if (context?.previousInfiniteQueries) {
        context.previousInfiniteQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error("Failed to delete order:", error);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}