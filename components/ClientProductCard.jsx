import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, Package } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import Image from "next/image";
import SignatureButton from "./SignatureButton";

// ─── constants ───────────────────────────────────────────────────────────────
const LOW_STOCK_TOTAL = 5; // card-level "low" threshold

export default function ClientProductCard({ product }) {
  // ── image carousel state ─────────────────────────────────────────────────
  const [imgIdx, setImgIdx] = useState(0);

  const images = (product.images || []).map((img) =>
    typeof img === "string" ? img : img.url,
  );

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

  // ── price helpers ────────────────────────────────────────────────────────
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price - (product.price * product.discount) / 100).toFixed(0)
    : product.price;

  // ── sorted variants ──────────────────────────────────────────────────────
  const sortedVariants = [...(product.variants || [])].sort((a, b) =>
    product.size_type === "numeric"
      ? Number(a.size) - Number(b.size)
      : a.size.localeCompare(b.size),
  );

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden border border-primarygreen-700/40 bg-primarygreen-900 shadow-2xl hover:shadow-xl transition-shadow duration-300 pb-3.5">
      {/* ── IMAGE SECTION ─────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
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

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primarygreen-900/60 backdrop-blur-[2px]">
            <span className="bg-primarygreen-900 border border-neutral-400/30 text-neutral-200 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low-stock tag */}
        {isLowStock && !isOutOfStock && (
          <span className="absolute bottom-3 left-3 z-10 bg-amber-600/90 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md shadow">
            Low Stock
          </span>
        )}

        {/* Carousel controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-primarygreen-900/70 backdrop-blur-sm border border-primarygreen-700/40 text-primarygreen-100 rounded-full p-1 sm:p-1.5 hover:bg-primarygreen-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-primarygreen-900/70 backdrop-blur-sm border border-primarygreen-700/40 text-primarygreen-100 rounded-full p-1 sm:p-1.5 hover:bg-primarygreen-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
                      : "w-1.5 bg-primarygreen-100/40 hover:bg-primarygreen-100/70",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-3">
        {/* Name / color / price */}
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
            {product.description && (
              <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
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
      </div>

      {/* ── FOOTER CTA ────────────────────────────────────────────────────── */}
      <SignatureButton
        text="view"
        path={`/shop/${product.id}`}
        icon={<Eye className="w-4 h-4" />}
      />

      <style>{`
        @keyframes statusPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(120, 183, 156, 0.6); }
          50%       { box-shadow: 0 0 0 4px rgba(120, 183, 156, 0); }
        }
      `}</style>
    </div>
  );
}
