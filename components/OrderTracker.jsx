"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getOrdersByPhone } from "@/services/apiOrders";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrderTracker() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await getOrdersByPhone(phoneNumber);
      const fetchedOrders = result.orders || [];
      setOrders(fetchedOrders);

      if (fetchedOrders.length === 0) {
        setError("No orders found for this phone number");
      }
    } catch (err) {
      setError("Error fetching orders. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="Enter your phone number (e.g., +201274100790)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-11 sm:h-12 px-4 text-sm bg-primarygreen-50 border-border placeholder:text-neutral-400/60 transition-all duration-200 focus-visible:ring-1 focus-visible:ring-primarygreen-500"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            className="gap-2 h-11 sm:h-12 text-primarygreen-50 bg-primarygreen-700 "
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-primarygreen-700">
                    {order.order_number}
                  </h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {order.customer_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="font-semibold text-gray-900">
                    {order.total_price.toLocaleString()} LE
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Delivery Address</p>
                  <p className="font-semibold text-gray-900">
                    {order.customer_address}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 bg-primarygreen-50 rounded border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product_name}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          Size: <span className="font-medium">{item.size}</span>
                        </span>
                        <span>
                          Color:{" "}
                          <span className="font-medium">
                            {item.product_color}
                          </span>
                        </span>
                        <span>
                          Qty:{" "}
                          <span className="font-medium">{item.quantity}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        EGP {item.subtotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        EGP {item.unit_price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}

        {searched && orders.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
