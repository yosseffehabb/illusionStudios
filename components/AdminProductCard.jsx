"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Cog, Package } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Image from "next/image";
import Link from "next/link";
import SignatureButton from "./SignatureButton";

// ─── constants ───────────────────────────────────────────────────────────────
const LOW_STOCK_PER_VARIANT = 2; // variant-level "low" threshold
const LOW_STOCK_TOTAL = 5; // card-level "low" threshold

export default function AdminProductCard({ product }) {
  // ── image carousel state ─────────────────────────────────────────────────
  const [imgIdx, setImgIdx] = useState(0);
  const images = product.images || [];

  const goTo = (i) => setImgIdx(i);
  const prev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  // ── stock helpers ────────────────────────────────────────────────────────
  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= LOW_STOCK_TOTAL;
  const isActive = product.status === "active";

  // ── price helpers ────────────────────────────────────────────────────────
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price - (product.price * product.discount) / 100).toFixed(0)
    : product.price;

  // ── sorted variants (numeric sizes sorted numerically, else alpha) ──────
  const sortedVariants = [...(product.variants || [])].sort((a, b) =>
    product.size_type === "numeric"
      ? Number(a.size) - Number(b.size)
      : a.size.localeCompare(b.size)
  );

  return (
    <div className="group flex flex-col rounded-xl  overflow-hidden border border-primarygreen-700/40 bg-primarygreen-900 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* ════════════════════════════════════════════════════════════════════
          IMAGE SECTION  — aspect 4:5 (1280 × 1600) — object-contain, no crop
          ════════════════════════════════════════════════════════════════════ */}

      <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
        {/* image or placeholder */}
        {images.length > 0 ? (
          <div className="w-full h-full bg-primarygreen-900 rounded-b-xl">
            <Image
              src={images[imgIdx]}
              alt={product.name}
              fill
              sizes="(max-width 640px) 100vw, (max-width 1024px) 50vw, 25vw"
              className="object-contain"
              loading="lazy"
              priority={false}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primarygreen-900/60">
            <Package className="w-10 h-10 text-primarygreen-500/50" />
          </div>
        )}

        {/* ── overlay badges row ─────────────────────────────────────────── */}

        {/* Discount ribbon — top-left */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 bg-darkred backdrop-blur-sm border border-primarygreen-100 text-primarygreen-100 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-md">
            -{product.discount}%
          </span>
        )}

        {/* Category badge — top-right */}
        <span className="absolute top-3 right-3 z-10 bg-primarygreen-900/80 backdrop-blur-sm border border-primarygreen-700/60 text-primarygreen-100 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-md">
          {product.category?.name || "Uncategorised"}
        </span>

        {/* Out-of-stock centre overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primarygreen-900/60 backdrop-blur-[2px]">
            <span className="bg-neutral-900/90 border border-neutral-400/30 text-neutral-200 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low-stock bottom-left tag (only when NOT out of stock) */}
        {isLowStock && !isOutOfStock && (
          <span className="absolute bottom-3 left-3 z-10 bg-amber-600/90 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow">
            Low Stock
          </span>
        )}

        {/* ── carousel arrows + dots ─────────────────────────────────────── */}
        {images.length > 1 && (
          <>
            {/* prev */}
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-primarygreen-900/70 backdrop-blur-sm border border-primarygreen-700/40 text-primarygreen-100 rounded-full p-1 sm:p-1.5 hover:bg-primarygreen-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {/* next */}
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-primarygreen-900/70 backdrop-blur-sm border border-primarygreen-700/40 text-primarygreen-100 rounded-full p-1 sm:p-1.5 hover:bg-primarygreen-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    goTo(i);
                  }}
                  aria-label={`Go to image ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === imgIdx
                      ? "w-5 bg-primarygreen-300"
                      : "w-1.5 bg-primarygreen-100/40 hover:bg-primarygreen-100/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          BODY
          ════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-3">
        {/* ── name / color / price row ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-neutral-50 leading-tight truncate">
              {product.name}
            </h3>
            {product.color && (
              <p className="text-[11px] text-primarygreen-300/70 mt-0.5">
                {product.color}
              </p>
            )}
          </div>

          {/* price block */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-sm font-bold text-neutral-50">
              {discountedPrice} L.E
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-neutral-400 line-through">
                {product.price} L.E
              </span>
            )}
          </div>
        </div>

        {/* ── thin gradient divider ────────────────────────────────────── */}
        <div className="h-px bg-linear-to-r from-transparent via-primarygreen-500/50 to-transparent" />

        {/* ── variants grid ────────────────────────────────────────────── */}
        {sortedVariants.length > 0 && (
          <div className="space-y-2">
            {/* header row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-400 tracking-widest uppercase">
                Sizes{" "}
                {product.size_type && (
                  <span className="font-normal normal-case tracking-normal opacity-60">
                    ({product.size_type})
                  </span>
                )}
              </span>

              {/* mini legend */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold text-neutral-400 tracking-widest uppercase">
                  Total Stock : {totalStock} units
                </span>
              </div>
            </div>

            {/* variant pills — 2-col grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(38px,1fr))] gap-1.5">
              {sortedVariants.map((v) => {
                const oos = v.stock === 0;
                const low = v.stock > 0 && v.stock <= LOW_STOCK_PER_VARIANT;

                return (
                  <div
                    key={v.id}
                    title={oos ? "Out of stock" : `${v.stock} in stock`}
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-lg border py-1 px-1 transition-colors",
                      oos
                        ? "border-neutral-400/25 bg-neutral-900/30 opacity-50"
                        : low
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-primarygreen-700/50 bg-primarygreen-900/50"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px] font-bold leading-none",
                        oos ? "text-neutral-400" : "text-neutral-50"
                      )}
                    >
                      {v.size}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] leading-tight mt-0.5",
                        oos
                          ? "text-neutral-500"
                          : low
                          ? "text-amber-400 font-semibold"
                          : "text-primarygreen-300/70"
                      )}
                    >
                      {v.stock}
                    </span>

                    {/* strike line on OOS */}
                    {oos && (
                      <div className="absolute inset-x-1 top-1/2 h-px bg-neutral-400/60 -translate-y-1/2 rotate-12" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── thin gradient divider ────────────────────────────────────── */}
        <div className="h-px bg-linear-to-r from-transparent via-primarygreen-500/50 to-transparent" />

        {/* ── SKU + status row ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {product.sku && (
            <span className="text-[10px] font-mono text-neutral-400">
              {product.sku}
            </span>
          )}

          {/* status pill with pulsing dot */}
          {product.status && (
            <div className="flex items-center gap-1.5">
              {/* dot */}
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isActive ? "bg-primarygreen-300" : "bg-neutral-400"
                )}
                style={
                  isActive
                    ? { animation: "statusPulse 2s ease-in-out infinite" }
                    : {}
                }
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-widest uppercase",
                  isActive ? "text-primarygreen-300" : "text-neutral-400"
                )}
              >
                {product.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER CTA
          ════════════════════════════════════════════════════════════════════ */}
      <SignatureButton
        text="Customize"
        path={`/admin/products/edit/${product.id}`}
      />

      {/* ── keyframes injected once ─────────────────────────────────────── */}
      <style>{`
        @keyframes statusPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(120, 183, 156, 0.6); }
          50%      { box-shadow: 0 0 0 4px rgba(120, 183, 156, 0); }
        }
      `}</style>
    </div>
  );
}
