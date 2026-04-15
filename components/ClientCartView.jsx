"use client";

import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

import React from "react";
import { Button } from "./ui/button";
import { AnimatePresence, motion } from "framer-motion";
import ClientLoadingState from "./ClientLoadingState";
import ClientErrorState from "./ClientErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import ClientOrderSummary from "./ClientOrderSummary";

export default function ClientCartView() {
  const {
    cart,
    deleteItem,
    incrementQuantity,
    decrementQuantity,
    isloading,
    error,
  } = useCart();

  function handleDeleteItem({ productid, size }) {
    deleteItem(productid, size);
  }
  function handleIncItem({ productid, size }) {
    incrementQuantity(productid, size);
  }
  function handleDecItem({ productid, size }) {
    decrementQuantity(productid, size);
  }

  ////////////////// Empty Cart ///////////////////

  if (!cart.length) {
    return (
      <div className="flex mt-8 items-center justify-center px-4">
        <motion.div {...fadeUp()} className="text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-primarygreen-700" />
          </div>
          <h2 className="text-2xl font-bold text-primarygreen-700">
            Your cart is empty
          </h2>
          <p className="mt-2 text-neutral-400">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-primarygreen-700 text-primarygreen-50"
          >
            <Link href="/shop">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4 text-primarygreen-50" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  ////////////////// Loading /////////////////

  if (isloading) {
    return <ClientLoadingState text="Loading Cart" />;
  }

  /////////////error////////////////////////

  if (error) {
    return (
      <ClientErrorState
        errorHeading="Error Getting Cart"
        errorBody="an error has ocuuerd"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden border-0 shadow-none sm:border sm:shadow-sm">
          <AnimatePresence>
            {cart.map((item, index) => (
              <motion.div
                key={`${item.product_id}-${item.size}`}
                {...fadeUp(index * 0.08)}
                layout
              >
                <div className="flex gap-2.5 p-2.5 sm:gap-4 sm:p-4 md:p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24 md:h-28 md:w-28 md:rounded-xl">
                    <Image
                      src={item.images?.[0]?.url || "/placeholder.png"}
                      alt={item.product_name}
                      fill
                      sizes="(max-width 640px) 100vw, (max-width 1024px) 50vw, 25vw"
                      className="object-contain rounded-lg md:rounded-xl"
                      loading="lazy"
                      priority={false}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-primarygreen-700 sm:text-sm md:text-base">
                          {item.product_name}
                        </h3>
                        <button
                          onClick={() =>
                            handleDeleteItem({
                              productid: item.product_id,
                              size: item.size,
                            })
                          }
                          className="shrink-0 rounded-md p-1 text-destructive transition-colors bg-destructive/10 hover:text-destructive sm:rounded-lg sm:p-1.5 hover:bg-destructive/30 duration-300"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-[10px] px-1.5 py-0 sm:mt-1.5 sm:text-xs sm:px-2.5 sm:py-0.5 text-primarygreen-50 bg-primarygreen-700"
                      >
                        Size: {item.size}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between sm:mt-3">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-primarygreen-700 sm:text-lg md:text-xl">
                          {(
                            Math.round(
                              item.unit_price *
                                (1 - (item.discount || 0) / 100),
                            ) * item.quantity
                          ).toLocaleString()}{" "}
                          LE
                        </p>
                        {item.discount > 0 && (
                          <p className="text-xs line-through text-muted-foreground">
                            {(item.unit_price * item.quantity).toLocaleString()}{" "}
                            LE
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 rounded-full border p-0.5 shadow-sm sm:gap-1 bg-primarygreen-700 text-primarygreen-50">
                        <button
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primarygreen-100 sm:h-8 sm:w-8 hover:text-primarygreen-700 transition-all duration-300"
                          onClick={() =>
                            handleDecItem({
                              productid: item.product_id,
                              size: item.size,
                            })
                          }
                        >
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>

                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="w-5 text-center text-xs font-semibold sm:w-8 sm:text-sm"
                        >
                          {item.quantity}
                        </motion.span>

                        <button
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-primarygreen-100 sm:h-8 sm:w-8 hover:text-primarygreen-700 transition-all duration-300"
                          onClick={() =>
                            handleIncItem({
                              productid: item.product_id,
                              size: item.size,
                            })
                          }
                        >
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {index < cart.length - 1 && <Separator />}
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      </div>

      {/* Order Summary */}
      <ClientOrderSummary />
    </div>
  );
}
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});
