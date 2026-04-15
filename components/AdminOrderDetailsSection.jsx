"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useOrderById, useUpdateOrderStatus } from "@/hooks/useOrdres";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatStatus } from "@/lib/utils/orderHelpers";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value || "—"}</span>
    </div>
  );
}

export default function AdminOrderDetailsSection() {
  const { id } = useParams();
  const { data: order, isLoading, error } = useOrderById(id);
  const updateStatusMutation = useUpdateOrderStatus();
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  useEffect(() => {
    if (order?.status) {
      setSelectedStatus(order.status);
    }
  }, [order?.status]);

  async function handleStatusUpdate() {
    if (!selectedStatus || !order?.id) return;

    setStatusError("");
    setStatusSuccess("");

    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        newStatus: selectedStatus,
      });
      setStatusSuccess("Order status updated successfully.");
    } catch (err) {
      setStatusError(err?.message || "Failed to update order status.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          <span className="text-sm">Loading order...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            {error?.message || "Order not found"}
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Update Order Status
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {formatStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleStatusUpdate}
            disabled={
              !selectedStatus ||
              selectedStatus === order.status ||
              updateStatusMutation.isPending
            }
            className="w-full sm:w-auto"
          >
            {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
          </Button>
        </div>

        {statusError ? (
          <p className="mt-3 text-sm text-red-600">{statusError}</p>
        ) : null}
        {statusSuccess ? (
          <p className="mt-3 text-sm text-green-600">{statusSuccess}</p>
        ) : null}
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Customer Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <InfoRow label="Name" value={order.customer_name} />
          <InfoRow label="Phone" value={order.customer_phone} />
          <InfoRow label="Address" value={order.customer_address} />
        </div>
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <InfoRow label="Notes" value={order.notes} />
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Qty
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.order_items?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="font-medium text-gray-900">
                    {item.product_name}
                  </div>
                  {item.product_color && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.product_color}
                    </div>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{item.size}</td>
                <td className="px-5 py-4 text-right text-gray-600">
                  {item.quantity}
                </td>
                <td className="px-5 py-4 text-right text-gray-600">
                  ${Number(item.unit_price).toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right font-medium text-gray-900">
                  ${Number(item.subtotal).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Price Summary
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>
              ${Number(order.subtotal ?? order.total_price).toFixed(2)}
            </span>
          </div>
          {order.shipping_fee != null && (
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${Number(order.shipping_fee).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>${Number(order.total_price).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
