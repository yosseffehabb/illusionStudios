"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Search,
  X,
  Package,
  Loader2,
  ChevronDown,
  Eye,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useOrders, useOrdersCount } from "@/hooks/useOrdres";
import Link from "next/link";
import {
  getStatusColor,
  formatStatus,
  formatDate,
  formatPrice,
} from "@/lib/utils/orderHelpers";
import { ORDER_STATUSES, PAGINATION } from "@/lib/constants";

export default function AdminOrdersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Use the smart hook that switches between browse/search
  const {
    data: orders = [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    mode,
  } = useOrders(debouncedSearch, { status: selectedStatus });

  const totalCount = useOrdersCount();

  // Refs for infinite scroll
  const tableEndRef = useRef(null);
  const observerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, PAGINATION.SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    if (mode !== "infinite" || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: PAGINATION.INFINITE_SCROLL_THRESHOLD,
        threshold: 0.1,
      },
    );

    const currentRef = tableEndRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    observerRef.current = observer;

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [mode, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasActiveFilters = searchQuery !== "" || selectedStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
  };

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium">Failed to load orders</p>
        <p className="text-sm text-red-600 mt-1">
          {error.message || "An error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primarygreen-500" />
          <Input
            placeholder="Search by order number, customer, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 w-full placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primarygreen-500 focus:border-primarygreen-500 focus-visible:ring-2 focus-visible:ring-primarygreen-500 focus-visible:ring-offset-0 bg-primarygreen-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-primarygreen-50"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 bg-primarygreen-50">
            <Filter className="h-4 w-4 mr-2 text-primarygreen-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {formatStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            className="w-full sm:w-auto h-10 bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700 transition-all duration-300"
          >
            Clear
            <X className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-380px)] overflow-auto">
          <table className="w-full">
            <thead className="bg-primarygreen-500 sticky top-0 z-10 text-primarygreen-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Order Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primarygreen-500" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Package className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">
                        {mode === "search"
                          ? "No orders found"
                          : "No orders yet"}
                      </p>
                      {hasActiveFilters && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your filters
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.customer_phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {formatPrice(order.total_price)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/order/${order.id}`}>
                          <Button className="h-8 bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {/* Infinite scroll sentinel */}
                  {mode === "infinite" && hasNextPage && (
                    <tr ref={tableEndRef}>
                      <td colSpan="6" className="px-4 py-8 text-center">
                        {isFetchingNextPage ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primarygreen-500" />
                            <span className="text-sm text-muted-foreground">
                              Loading more orders...
                            </span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => fetchNextPage()}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <ChevronDown className="h-4 w-4" />
                            Load More
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-primarygreen-500" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white">
            <Package className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              {mode === "search" ? "No orders found" : "No orders yet"}
            </p>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters
              </p>
            )}
          </div>
        ) : (
          <div className="max-h-[calc(100vh-380px)] overflow-y-auto bg-primarygreen-50 p-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 space-y-3 bg-white rounded-lg shadow-sm border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {order.customer_name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {order.customer_phone}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-semibold">
                      {formatPrice(order.total_price)}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <Link href={`/admin/order/${order.id}`}>
                  <Button className="w-full h-9 bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            ))}

            {/* Infinite scroll sentinel for mobile */}
            {mode === "infinite" && hasNextPage && (
              <div ref={tableEndRef} className="py-4 text-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primarygreen-500" />
                    <span className="text-sm text-muted-foreground">
                      Loading more...
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={() => fetchNextPage()}
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load More Orders
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {orders.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          {mode === "search" ? (
            <span>
              Found {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          ) : (
            <span>
              Showing {orders.length}
              {totalCount > 0 && ` of ${totalCount}`} order
              {orders.length !== 1 ? "s" : ""}
              {hasNextPage && " • Scroll for more"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
