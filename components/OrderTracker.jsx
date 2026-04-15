"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getOrdersByPhone } from "@/services/apiOrders";

// ─── constants ───────────────────────────────────────────────────────────────

const STEPS = ["pending", "confirmed", "out_for_delivery", "delivered"];

const STATUS_CFG = {
  pending: { label: "Pending", fillPct: 0 },
  confirmed: { label: "Confirmed", fillPct: 33 },
  out_for_delivery: { label: "Out for Delivery", fillPct: 66 },
  delivered: { label: "Delivered", fillPct: 100 },
  cancelled: { label: "Cancelled", fillPct: 0 },
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function normalizeEgyptPhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10 || !digits.startsWith("1")) return null;
  return `+20${digits}`;
}

function shippingCost(order) {
  const itemsTotal = (order.order_items ?? []).reduce(
    (sum, i) => sum + Number(i.subtotal ?? 0),
    0,
  );
  return Number(order.total_price ?? 0) - itemsTotal;
}

// ─── Step Icons ───────────────────────────────────────────────────────────────

const STEP_ICONS = {
  pending: (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  confirmed: (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  out_for_delivery: (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  delivered: (
    <svg
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10" />
      <polyline points="3 6 12 2 21 6" />
      <polyline points="3 6 12 10 21 6" />
    </svg>
  ),
};

// ─── StatusTimeline ───────────────────────────────────────────────────────────

function StatusTimeline({ status }) {
  const currentIdx = STEPS.indexOf(status);

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 text-red-500 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <span className="text-sm font-medium text-red-600">
          Order cancelled
        </span>
      </div>
    );
  }

  // Calculate fill % based on step index across 3 segments
  const segmentPct =
    currentIdx <= 0 ? 0 : (currentIdx / (STEPS.length - 1)) * 100;

  return (
    <div className="px-4 py-5">
      <div className="relative flex items-start justify-between">
        {/* Track background */}
        <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-border" />

        {/* Track fill */}
        <div
          className="absolute top-3.5 left-3.5 h-0.5 bg-primarygreen-500 transition-all duration-500"
          style={{ width: `calc(${segmentPct}% * (1 - 7px / 100%) )` }}
        />
        {/* Simpler fill calculation */}
        <div
          className="absolute top-3.5 h-0.5 bg-primarygreen-500 transition-all duration-500"
          style={{
            left: "14px",
            width:
              currentIdx <= 0
                ? "0px"
                : `calc((100% - 28px) * ${currentIdx / (STEPS.length - 1)})`,
          }}
        />

        {STEPS.map((step, i) => {
          const active = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-1.5 flex-1"
            >
              {/* Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  active
                    ? "bg-primarygreen-600 border-primarygreen-600 text-white shadow-sm"
                    : "bg-background border-border text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-primarygreen-300 ring-offset-1" : ""}`}
              >
                {STEP_ICONS[step]}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium text-center leading-tight ${
                  active ? "text-primarygreen-600" : "text-muted-foreground"
                }`}
              >
                {STATUS_CFG[step].label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────

const PILL_STYLES = {
  pending: "bg-amber-100  text-amber-800",
  confirmed: "bg-blue-100   text-blue-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100  text-green-800",
  cancelled: "bg-red-100    text-red-700",
};

const DOT_STYLES = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-400",
  out_for_delivery: "bg-orange-400",
  delivered: "bg-green-500",
  cancelled: "bg-red-400",
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${PILL_STYLES[status] ?? PILL_STYLES.pending}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[status] ?? DOT_STYLES.pending}`}
      />
      {cfg.label}
    </span>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const shipping = shippingCost(order);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold font-mono truncate text-primarygreen-700">
            {order.order_number ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {order.customer_name}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {order.customer_address}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status={order.status} />
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Collapsible body */}
      <div
        className={`border-t border-border transition-all duration-300 overflow-hidden bg-primarygreen-50 ${
          open ? "max-h-[700px]" : "max-h-0 border-t-0"
        }`}
      >
        <StatusTimeline status={order.status} />

        {/* Items */}
        <div className="px-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Items
          </p>
          {(order.order_items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-2 py-1.5 border-b border-border last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm truncate">{item.product_name}</p>
                {item.quantity > 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium font-mono shrink-0">
                {Number(item.subtotal ?? 0).toFixed(2)} EGP
              </span>
            </div>
          ))}

          {shipping > 0 && (
            <div className="flex justify-between py-1.5 text-muted-foreground">
              <span className="text-sm">Shipping</span>
              <span className="text-sm font-mono">
                {shipping.toFixed(2)} EGP
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border mt-1">
          {order.customer_address ? (
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Shipping to</p>
              <p className="text-xs truncate max-w-[160px] sm:max-w-[240px]">
                {order.customer_address}
              </p>
            </div>
          ) : (
            <div />
          )}
          <div className="text-right shrink-0">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="text-lg font-semibold font-mono">
              {Number(order.total_price ?? 0).toFixed(2)} EGP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OrderTracker (main) ──────────────────────────────────────────────────────

export default function OrderTracker() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  async function handleSearch() {
    const normalized = normalizeEgyptPhone(phoneNumber);

    if (!normalized) {
      setError("Enter phone number in this format: 1x xxxx xxxx");
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError("");
    setOrders([]);

    try {
      const result = await getOrdersByPhone(normalized);

      if (!result.success) {
        setError(result.error || "Could not fetch orders. Please try again.");
        return;
      }

      const fetched = result.orders ?? [];
      setOrders(fetched);
      if (!fetched.length) setError("No orders found for this phone number.");
    } catch (err) {
      setError(err?.message || "Could not fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 space-y-4">
        {/* Search card */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-lg border border-border bg-primarygreen-50 focus-within:ring-2 focus-within:ring-primarygreen-500 focus-within:border-primarygreen-500 overflow-hidden transition-all min-w-0">
              <span className="px-3 text-sm font-medium font-mono text-primarygreen-700 border-r border-border bg-primarygreen-50/60 shrink-0 self-stretch flex items-center">
                +20
              </span>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="1x xxxx xxxx"
                value={phoneNumber}
                maxLength={10}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-11 px-3 font-mono text-sm placeholder:text-muted-foreground/50 min-w-0"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-11 shrink-0 bg-primarygreen-700 hover:bg-primarygreen-800 text-primarygreen-50 gap-1.5 px-4"
            >
              {isLoading ? (
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="32"
                    strokeDashoffset="12"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
              <span className="hidden sm:inline">
                {isLoading ? "Searching..." : "Search"}
              </span>
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-red-500 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Orders */}
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
