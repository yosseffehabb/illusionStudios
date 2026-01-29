"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrdersByPhone, getOrderByNumber } from "@/services/apiOrders";
import {
  getStatusColor,
  formatStatus,
  formatFullDate,
  formatPrice,
} from "@/lib/utils/orderHelpers";

export default function OrderTracker() {
  const [searchType, setSearchType] = useState("phone");
  const [searchValue, setSearchValue] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrders([]);

    try {
      let result;

      if (searchType === "phone") {
        result = await getOrdersByPhone(searchValue);
        if (result.success) {
          setOrders(result.orders);
          if (result.orders.length === 0) {
            setError("No orders found for this phone number");
          }
        } else {
          setError(result.error || "Failed to fetch orders");
        }
      } else {
        result = await getOrderByNumber(searchValue);
        if (result.success && result.order) {
          setOrders([result.order]);
        } else {
          setError(result.error || "Order not found");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-5 h-5 text-yellow-600" />,
      confirmed: <CheckCircle className="w-5 h-5 text-blue-600" />,
      out_for_delivery: <Truck className="w-5 h-5 text-purple-600" />,
      delivered: <Package className="w-5 h-5 text-green-600" />,
      cancelled: <XCircle className="w-5 h-5 text-red-600" />,
    };
    return icons[status] || <Package className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSearchType("phone")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              searchType === "phone"
                ? "bg-primarygreen-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Search by Phone
          </button>
          <button
            type="button"
            onClick={() => setSearchType("orderNumber")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              searchType === "orderNumber"
                ? "bg-primarygreen-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Search by Order #
          </button>
        </div>

        <div className="relative">
          <Input
            type={searchType === "phone" ? "tel" : "text"}
            placeholder={
              searchType === "phone"
                ? "Enter your phone number"
                : "Enter order number"
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pr-12 h-12 text-base"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            className="absolute right-1 top-1 h-10 bg-primarygreen-500 hover:bg-primarygreen-700"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {orders.length === 1 ? "Your Order" : `Your Orders (${orders.length})`}
          </h2>
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-5 space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <div className="font-semibold text-lg text-gray-900">
                    {order.order_number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {order.customer_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatFullDate(order.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Items Ordered:
                </div>
                <ul className="space-y-2">
                  {order.order_items?.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-start text-sm bg-gray-50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.quantity}x {item.product_name}
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          {item.product_color && `Color: ${item.product_color}`}
                          {item.product_color && item.size && " • "}
                          {item.size && `Size: ${item.size}`}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatPrice(item.subtotal)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="border-t pt-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-700 mb-1">
                        Shipping Address:
                      </div>
                      <div className="text-gray-600">
                        {order.shipping_address}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Order Total:</span>
                <span className="text-xl font-bold text-primarygreen-600">
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg font-medium mb-2">
            Track Your Order
          </p>
          <p className="text-gray-500 text-sm">
            Enter your phone number or order number above to see your order
            status
          </p>
        </div>
      )}
    </div>
  );
}