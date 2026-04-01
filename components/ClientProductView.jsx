"use client";

import { useProductById } from "@/hooks/useProducts";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Loader2,
  RotateCcw,
  ShieldCheckIcon,
  Truck,
  Heart,
  ChevronLeft,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

/* ─────────────────────────────────────────
   Stagger animation helpers
───────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
});

const TRUST_BADGES = [
  { icon: ShieldCheckIcon, label: "Secure checkout" },
  { icon: RotateCcw, label: "30-day returns" },
  { icon: Truck, label: "Free shipping" },
];

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
export default function ClientProductView({ productId }) {
  const {
    data: product,
    isLoading: isProductLoading,
    error: isProductError,
  } = useProductById(productId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const priceAfterDiscount =
    product?.discount > 0
      ? (product?.price * (1 - product?.discount / 100)).toFixed(2)
      : null;

  const discountAmount =
    product?.discount > 0
      ? (product?.price * (product?.discount / 100)).toFixed(2)
      : null;

  const activeVariant = selectedVariant
    ? product?.variants.find((v) => v.id === selectedVariant)
    : null;

  const isOutOfStock = activeVariant ? activeVariant.stock === 0 : false;
  const isLowStock = activeVariant
    ? activeVariant.stock > 0 && activeVariant.stock <= 5
    : false;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  /* ── Loading ── */
  if (isProductLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
          Loading product
        </p>
      </div>
    );
  }

  /* ── Error ── */
  if (isProductError) {
    return (
      <motion.div
        {...fadeUp()}
        className="mx-auto max-w-md mt-16 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3"
      >
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Failed to load product</p>
          <p className="text-sm opacity-80 mt-0.5">
            {isProductError.message || "An unexpected error occurred"}
          </p>
        </div>
      </motion.div>
    );
  }

  /* ── Stock label ── */
  const stockLabel = activeVariant
    ? isOutOfStock
      ? { text: "Out of stock", color: "text-red-500" }
      : isLowStock
        ? { text: `Only ${activeVariant.stock} left`, color: "text-amber-500" }
        : { text: `${activeVariant.stock} in stock`, color: "text-emerald-600" }
    : null;

  /* ── Add-to-cart button label ── */
  const cartLabel = !selectedVariant
    ? "Select a size"
    : isOutOfStock
      ? "Out of Stock"
      : addedToCart
        ? "Added to cart ✓"
        : "Add to Cart";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-14">
        {/* ───── Two-column grid ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* ══ LEFT — Image Gallery ══ */}
          <motion.div
            className="space-y-4 lg:sticky lg:top-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Main image */}
            <div
              className={`relative aspect-4/5 rounded-3xl overflow-hidden bg-muted cursor-zoom-in group`}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setImageZoomed(true)}
              onMouseLeave={() => setImageZoomed(false)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage]?.url}
                  alt={product.name}
                  className="w-full h-full object-cover will-change-transform"
                  style={
                    imageZoomed
                      ? {
                          transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                          transform: "scale(1.35)",
                          transition: "transform 0.1s ease-out",
                        }
                      : {
                          transform: "scale(1)",
                          transition: "transform 0.4s ease",
                        }
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                  width={800}
                  height={1000}
                />
              </AnimatePresence>

              {/* Discount badge */}
              {product.discount > 0 && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
                  className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg shadow-md"
                >
                  -{product.discount}%
                </motion.span>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5 text-xs text-white bg-primarygreen-500 backdrop-blur-sm px-2.5 py-1.5 rounded-full pointer-events-none">
                <ZoomIn className="w-3 h-3" />
                Hover to zoom
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 flex-wrap">
                {product.images.map((img, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-[72px] h-[86px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? "border-primarygreen-500 shadow-[0_0_0_3px_hsl(var(--primarygreen-500)/0.2)]"
                        : "border-transparent opacity-55 hover:opacity-90 hover:border-border"
                    }`}
                  >
                    <Image
                      src={img?.url}
                      alt={`${product.name} view ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={72}
                      height={86}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ══ RIGHT — Product Info ══ */}
          <div className="flex flex-col gap-7 lg:pt-2">
            {/* Category + SKU */}
            <motion.div
              {...fadeUp(0.1)}
              className="flex items-center justify-between"
            >
              <span className="text-[11px] tracking-[0.18em] uppercase text-primarygreen-700 font-semibold">
                {product.category?.name ?? "Uncategorized"}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono tracking-wide">
                SKU: {product.sku}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              {...fadeUp(0.15)}
              className="text-3xl sm:text-4xl font-bold tracking-tight text-primarygreen-700 leading-[1.15] uppercase"
            >
              {product.name}
            </motion.h1>

            {/* Description */}
            {product.description && (
              <motion.p
                {...fadeUp(0.2)}
                className="text-neutral-400 leading-relaxed text-[14.5px]"
              >
                {product.description}
              </motion.p>
            )}

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* Price */}
            <motion.div
              {...fadeUp(0.22)}
              className="flex items-baseline gap-3 flex-wrap"
            >
              {priceAfterDiscount ? (
                <>
                  <span className="text-3xl font-extrabold text-foreground tracking-tight">
                    {priceAfterDiscount} L.E
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {product.price.toFixed(2)} L.E
                  </span>
                  <span className="inline-flex items-center text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                    Save {parseFloat(discountAmount)} L.E
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-foreground tracking-tight">
                  {product.price.toFixed(2)} L.E
                </span>
              )}
            </motion.div>

            {/* Color swatch */}
            {product.color && (
              <motion.div {...fadeUp(0.24)} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Color:</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white ring-2 ring-primary/30 shadow-sm"
                    style={{ backgroundColor: product.color.toLowerCase() }}
                  />
                  <span className="text-sm font-medium text-foreground capitalize">
                    {product.color}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Variants */}
            <motion.div {...fadeUp(0.26)} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-400">
                  SIZE: {product.size_type.toUpperCase()}
                </span>
                <AnimatePresence mode="wait">
                  {stockLabel && (
                    <motion.span
                      key={stockLabel.text}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className={`text-xs font-semibold ${stockLabel.color}`}
                    >
                      {stockLabel.text}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const outOfStock = variant.stock === 0;
                  const isSelected = selectedVariant === variant.id;
                  return (
                    <motion.button
                      key={variant.id}
                      whileHover={!outOfStock ? { y: -2, scale: 1.03 } : {}}
                      whileTap={!outOfStock ? { scale: 0.96 } : {}}
                      onClick={() =>
                        !outOfStock && setSelectedVariant(variant.id)
                      }
                      disabled={outOfStock}
                      className={`h-11 min-w-12 px-5 rounded-xl text-sm font-semibold border-2 transition-colors duration-200 relative ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-[0_2px_12px_hsl(var(--primary)/0.35)]"
                          : outOfStock
                            ? "opacity-25 cursor-not-allowed border-border text-muted-foreground line-through"
                            : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted/40"
                      }`}
                    >
                      {variant.size}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* Trust badges */}
            <motion.div {...fadeUp(0.3)} className="flex gap-5 flex-wrap">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div {...fadeUp(0.32)} className="flex gap-3 pt-1">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={!selectedVariant || isOutOfStock}
                className={`flex-1 h-13 text-[15px] font-bold rounded-2xl transition-all duration-300 cursor-pointer text-primarygreen-100 tracking-wide bg-primarygreen-500
                  ${
                    addedToCart
                      ? "bg-emerald-600 text-white shadow-[0_4px_24px_rgba(16,185,129,0.35)]"
                      : !selectedVariant || isOutOfStock
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        : ""
                  }
                `}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={cartLabel}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="block"
                  >
                    {cartLabel}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
