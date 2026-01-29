import React from 'react'
import { Skeleton } from './ui/skeleton'

export default function SkeletonAdminOrderStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
  )
}
