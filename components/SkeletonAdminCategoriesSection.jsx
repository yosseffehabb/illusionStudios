import React from "react";
import { Skeleton } from "./ui/skeleton";

export default function SkeletonAdminCategoriesSection() {
  return (
    <div>
      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-neutral-400 p-4 bg-primarygreen-50"
          >
            {/* Delete button skeleton */}
            <Skeleton className="absolute top-2 right-2 h-6 w-6 rounded" />
            
            {/* Category info skeleton */}
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-3 w-32 mb-4" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Results Count Skeleton */}
      <div className="mt-4 text-center sm:text-left">
        <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
      </div>
    </div>
  );
}
