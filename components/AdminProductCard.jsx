"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Cog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function AdminProductCard({ product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [];

  // Calculate total stock from variants
  const totalStock =
    product.variants?.reduce((acc, variant) => acc + variant.stock, 0) || 0;

  // Check if product is low stock
  const isLowStock = totalStock > 0 && totalStock <= 5;
  const isOutOfStock = totalStock === 0;

  const nextImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50 flex flex-col">
      {/* Image Container */}
      <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
        {images.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center p-2">
            <Image
              className="object-contain w-full h-full rounded-2xl"
              src={images[currentImageIndex]}
              alt={product.name}
              width={400}
              height={400}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
              loading="lazy"
              priority={false}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10">
            <Badge className="text-[8px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-700 text-white">
              -{product.discount}%
            </Badge>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10">
          <Badge className="text-[8px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black text-white border-0">
            {product.category?.name || "Uncategorized"}
          </Badge>
        </div>

        {/* Stock Warning Badge */}
        {isOutOfStock && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Badge className="bg-red-600 text-white text-xs px-3 py-1">
              OUT OF STOCK
            </Badge>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10">
            <Badge className="bg-orange-500 text-white text-[8px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
              Low Stock
            </Badge>
          </div>
        )}

        {/* Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous image"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-1 sm:p-1.5 rounded-full transition-all hover:bg-background hover:scale-110 z-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm p-1 sm:p-1.5 rounded-full transition-all hover:bg-background hover:scale-110 z-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>

            {/* Image Dots */}
            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                  className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
                    idx === currentImageIndex
                      ? "bg-primary w-3 sm:w-4"
                      : "bg-background/60 hover:bg-background/80",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 space-y-1 sm:space-y-2 grow">
        {/* Product Name & Color */}
        <div>
          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight">
            {product.name}
          </h3>
          {product.color && (
            <p className="text-xs text-muted-foreground">{product.color}</p>
          )}
        </div>

        {/* Sizes & Stock */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Sizes {product.size_type && `(${product.size_type})`}
              </span>
              <span className="text-xs">
                Total:{" "}
                <span
                  className={cn(
                    "font-medium",
                    isOutOfStock
                      ? "text-red-600"
                      : isLowStock
                      ? "text-orange-600"
                      : "text-green-600",
                  )}
                >
                  {totalStock}
                </span>
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {product.variants.map((variant) => {
                const available = variant.stock > 0;
                const lowStock = variant.stock > 0 && variant.stock <= 2;

                return (
                  <div
                    key={variant.id}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-2 py-1",
                      "text-[10px] leading-tight",
                      available
                        ? lowStock
                          ? "bg-orange-50 text-orange-700 border-orange-300"
                          : "bg-muted text-foreground border-border"
                        : "bg-red-50 text-red-700 opacity-70 border-red-300",
                    )}
                  >
                    <span className="font-medium">{variant.size}</span>
                    <span
                      className={cn(
                        lowStock && "text-orange-600 font-semibold",
                      )}
                    >
                      ({variant.stock})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SKU & Status */}
        <div className="flex items-center justify-between pt-1">
          {product.sku && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {product.sku}
            </span>
          )}
          {product.status && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                product.status === "active"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-gray-50 text-gray-700 border-gray-200",
              )}
            >
              {product.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Customize Button */}
      <Link href={`/admin/products/edit/${product.id}`}>
        <Button className="w-full text-xs bg-primarygreen-500 text-primarygreen-50 hover:bg-primarygreen-700 rounded-t-none rounded-b-lg">
          Customize <Cog />
        </Button>
      </Link>
    </div>
  );
}
