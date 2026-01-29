
import React from "react";
import { Skeleton } from "./ui/skeleton";

export default function SkeletonAdminOrdersTable() {
  return (
    <div>
      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden sm:block border rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-280px)] overflow-auto">
          <table className="w-full">
            <thead className="bg-primarygreen-500 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primarygreen-50">
                  Order Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primarygreen-50">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primarygreen-50">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primarygreen-50">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primarygreen-50">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primarygreen-50">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {[...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-8 w-16 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="sm:hidden border rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto bg-primarygreen-50 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 space-y-3 bg-white rounded-lg shadow-sm border"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>

              <Skeleton className="h-9 w-full rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Results Count Skeleton */}
      <div className="mt-4 text-center sm:text-left">
        <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
      </div>
    </div>
  );
}
