"use client";

import React from "react";
import { Clock, CheckCircle, Truck, Package, XCircle } from "lucide-react";
import { useOrderStats } from "@/hooks/useOrdres";
import { ORDER_STATUSES } from "@/lib/constants";
import { getStatusIconConfig, formatStatus } from "@/lib/utils/orderHelpers";

export default function AdminOrderStats() {
  const { data: stats, isLoading, error } = useOrderStats();

  const getIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      out_for_delivery: Truck,
      delivered: Package,
      cancelled: XCircle,
    };
    return icons[status] || Package;
  };

  // Error state
  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">
          {error.message || "Failed to load statistics"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {ORDER_STATUSES.map((status) => {
        const config = getStatusIconConfig(status);
        const Icon = getIcon(status);
        const count = stats?.[status] || 0;

        return (
          <div
            key={status}
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {count}
                </span>
              )}
            </div>
            <div className="text-xs font-medium text-gray-600 capitalize">
              {formatStatus(status)}
            </div>
          </div>
        );
      })}
    </div>
  );
}